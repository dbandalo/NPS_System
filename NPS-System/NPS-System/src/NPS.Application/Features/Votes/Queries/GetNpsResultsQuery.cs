using MediatR;
using NPS.Application.DTOs;

namespace NPS.Application.Features.Votes.Queries;

public class GetNpsResultsQuery : IRequest<NpsResultDto>
{
}
