using MediatR;
using NPS.Application.DTOs;

namespace NPS.Application.Features.Auth.Commands;

public class RefreshTokenCommand : IRequest<RefreshTokenResponseDto>
{
    public string RefreshToken { get; set; } = string.Empty;
}
