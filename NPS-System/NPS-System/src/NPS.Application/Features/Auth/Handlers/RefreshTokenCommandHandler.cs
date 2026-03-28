using MediatR;
using Microsoft.Extensions.Configuration;
using NPS.Application.DTOs;
using NPS.Application.Features.Auth.Commands;
using NPS.Application.Interfaces;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Auth.Handlers;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResponseDto>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IConfiguration _configuration;

    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IConfiguration configuration)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _configuration = configuration;
    }

    public async Task<RefreshTokenResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

        if (storedToken == null || !storedToken.IsActive)
        {
            return new RefreshTokenResponseDto
            {
                Success = false,
                Message = "Token inválido o expirado"
            };
        }

        var user = await _userRepository.GetByIdAsync(storedToken.UserId);
        if (user == null || user.IsLocked)
        {
            return new RefreshTokenResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado o bloqueado"
            };
        }

        // Revoke old refresh token
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        await _refreshTokenRepository.RevokeAsync(request.RefreshToken, newRefreshToken);

        // Create new refresh token
        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        // Generate new access token
        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);
        var accessMinutes = int.TryParse(_configuration["JwtSettings:ExpirationMinutes"], out var am) ? am : 5;
        var expiresAt = DateTime.UtcNow.AddMinutes(accessMinutes);

        return new RefreshTokenResponseDto
        {
            Success = true,
            Message = "Token renovado exitosamente",
            AccessToken = accessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = expiresAt
        };
    }
}
