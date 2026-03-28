using AutoMapper;
using MediatR;
using NPS.Application.DTOs;
using NPS.Application.Features.Votes.Queries;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Votes.Handlers;

public class GetNpsResultsQueryHandler : IRequestHandler<GetNpsResultsQuery, NpsResultDto>
{
    private readonly IVoteRepository _voteRepository;
    private readonly IMapper _mapper;

    public GetNpsResultsQueryHandler(IVoteRepository voteRepository, IMapper mapper)
    {
        _voteRepository = voteRepository;
        _mapper = mapper;
    }

    public async Task<NpsResultDto> Handle(GetNpsResultsQuery request, CancellationToken cancellationToken)
    {
        var statistics = await _voteRepository.GetNpsStatisticsAsync();
        var votes = await _voteRepository.GetAllAsync();

        var result = _mapper.Map<NpsResultDto>(statistics);
        result.RecentVotes = _mapper.Map<List<VoteDto>>(votes.OrderByDescending(v => v.CreatedAt).Take(10).ToList());

        return result;
    }
}
