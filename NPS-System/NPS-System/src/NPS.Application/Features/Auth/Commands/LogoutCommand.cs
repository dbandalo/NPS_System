using MediatR;

namespace NPS.Application.Features.Auth.Commands;

public class LogoutCommand : IRequest<bool>
{
    public int UserId { get; set; }
    public string? RefreshToken { get; set; }
}
