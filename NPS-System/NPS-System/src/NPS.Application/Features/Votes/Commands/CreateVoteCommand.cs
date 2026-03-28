using MediatR;
using NPS.Application.DTOs;

namespace NPS.Application.Features.Votes.Commands;

public class CreateVoteCommand : IRequest<VoteDto>
{
    public int UserId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
}
