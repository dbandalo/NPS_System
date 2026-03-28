using MediatR;
using NPS.Application.DTOs;
using NPS.Application.Features.Votes.Queries;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Votes.Handlers;

public class GetUserVoteStatusQueryHandler : IRequestHandler<GetUserVoteStatusQuery, VoteStatusDto>
{
    private readonly IVoteRepository _voteRepository;

    public GetUserVoteStatusQueryHandler(IVoteRepository voteRepository)
    {
        _voteRepository = voteRepository;
    }

    public async Task<VoteStatusDto> Handle(GetUserVoteStatusQuery request, CancellationToken cancellationToken)
    {
        var hasVoted = await _voteRepository.HasUserVotedAsync(request.UserId);
        return new VoteStatusDto { HasVoted = hasVoted };
    }
}
