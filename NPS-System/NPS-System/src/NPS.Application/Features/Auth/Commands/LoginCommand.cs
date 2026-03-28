using MediatR;
using NPS.Application.DTOs;

namespace NPS.Application.Features.Auth.Commands;

public class LoginCommand : IRequest<LoginResponseDto>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
}
