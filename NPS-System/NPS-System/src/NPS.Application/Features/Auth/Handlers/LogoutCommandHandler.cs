using MediatR;
using NPS.Application.Features.Auth.Commands;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Auth.Handlers;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LogoutCommandHandler(IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            await _refreshTokenRepository.RevokeAsync(request.RefreshToken);
        }
        else
        {
            await _refreshTokenRepository.RevokeAllByUserIdAsync(request.UserId);
        }

        return true;
    }
}
