using MediatR;
using NPS.Application.DTOs;

namespace NPS.Application.Features.Votes.Queries;

public class GetUserVoteStatusQuery : IRequest<VoteStatusDto>
{
    public int UserId { get; set; }
}
