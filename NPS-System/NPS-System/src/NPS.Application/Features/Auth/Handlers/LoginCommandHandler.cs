using AutoMapper;
using MediatR;
using NPS.Application.DTOs;
using NPS.Application.Features.Auth.Commands;
using NPS.Application.Interfaces;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Auth.Handlers;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ILoginAttemptRepository _loginAttemptRepository;
    private readonly IVoteRepository _voteRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IMapper _mapper;

    private const int MaxFailedAttempts = 3;
    private const int LockoutMinutes = 15;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ILoginAttemptRepository loginAttemptRepository,
        IVoteRepository voteRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _loginAttemptRepository = loginAttemptRepository;
        _voteRepository = voteRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _mapper = mapper;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username);

        // User not found
        if (user == null)
        {
            await LogLoginAttempt(null, request.Username, request.IpAddress, false, "Usuario no encontrado");
            return new LoginResponseDto
            {
                Success = false,
                Message = "Credenciales inválidas"
            };
        }

        // Check if user is locked
        if (user.IsLocked && user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
        {
            await LogLoginAttempt(user.Id, request.Username, request.IpAddress, false, "Cuenta bloqueada");
            var remainingMinutes = (int)(user.LockedUntil.Value - DateTime.UtcNow).TotalMinutes + 1;
            return new LoginResponseDto
            {
                Success = false,
                Message = $"Cuenta bloqueada. Intente nuevamente en {remainingMinutes} minutos."
            };
        }

        // Unlock if lockout period has passed
        if (user.IsLocked && user.LockedUntil.HasValue && user.LockedUntil <= DateTime.UtcNow)
        {
            await _userRepository.UnlockUserAsync(user.Id);
            user.IsLocked = false;
            user.FailedLoginAttempts = 0;
        }

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            await _userRepository.IncrementFailedLoginAttemptsAsync(user.Id);
            user.FailedLoginAttempts++;

            if (user.FailedLoginAttempts >= MaxFailedAttempts)
            {
                var lockedUntil = DateTime.UtcNow.AddMinutes(LockoutMinutes);
                await _userRepository.LockUserAsync(user.Id, lockedUntil);
                await LogLoginAttempt(user.Id, request.Username, request.IpAddress, false, "Máximo de intentos alcanzado - Cuenta bloqueada");
                
                return new LoginResponseDto
                {
                    Success = false,
                    Message = $"Cuenta bloqueada por {LockoutMinutes} minutos debido a múltiples intentos fallidos."
                };
            }

            await LogLoginAttempt(user.Id, request.Username, request.IpAddress, false, "Contraseña incorrecta");
            var remainingAttempts = MaxFailedAttempts - user.FailedLoginAttempts;
            return new LoginResponseDto
            {
                Success = false,
                Message = $"Credenciales inválidas. {remainingAttempts} intento(s) restante(s)."
            };
        }

        // Successful login
        await _userRepository.ResetFailedLoginAttemptsAsync(user.Id);
        await LogLoginAttempt(user.Id, request.Username, request.IpAddress, true, null);

        // Generate tokens
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(5); // 5 minutes session

        // Save refresh token
        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Check if user has voted
        var hasVoted = await _voteRepository.HasUserVotedAsync(user.Id);

        var userDto = _mapper.Map<UserDto>(user);
        userDto.HasVoted = hasVoted;

        return new LoginResponseDto
        {
            Success = true,
            Message = "Login exitoso",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = userDto
        };
    }

    private async Task LogLoginAttempt(int? userId, string username, string ipAddress, bool isSuccessful, string? failureReason)
    {
        await _loginAttemptRepository.CreateAsync(new LoginAttempt
        {
            UserId = userId,
            Username = username,
            IpAddress = ipAddress,
            IsSuccessful = isSuccessful,
            FailureReason = failureReason
        });
    }
}
