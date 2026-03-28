using AutoMapper;
using MediatR;
using NPS.Application.DTOs;
using NPS.Application.Exceptions;
using NPS.Application.Features.Votes.Commands;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;

namespace NPS.Application.Features.Votes.Handlers;

public class CreateVoteCommandHandler : IRequestHandler<CreateVoteCommand, VoteDto>
{
    private readonly IVoteRepository _voteRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public CreateVoteCommandHandler(
        IVoteRepository voteRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _voteRepository = voteRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<VoteDto> Handle(CreateVoteCommand request, CancellationToken cancellationToken)
    {
        // Check if user exists
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
        {
            throw new NotFoundException("Usuario no encontrado");
        }

        // Check if user has already voted
        var hasVoted = await _voteRepository.HasUserVotedAsync(request.UserId);
        if (hasVoted)
        {
            throw new BusinessException("El usuario ya ha emitido su voto");
        }

        // Create vote
        var vote = new Vote
        {
            UserId = request.UserId,
            Score = request.Score,
            Comment = request.Comment
        };

        vote.Id = await _voteRepository.CreateAsync(vote);
        vote.User = user;

        return _mapper.Map<VoteDto>(vote);
    }
}
