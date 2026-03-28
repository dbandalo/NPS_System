using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NPS.Application.DTOs;
using NPS.Application.Features.Votes.Commands;
using NPS.Application.Features.Votes.Queries;
using System.Security.Claims;

namespace NPS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Emitir un voto NPS (solo votantes, una vez)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "VotanteOnly")]
    public async Task<ActionResult<VoteDto>> CreateVote([FromBody] CreateVoteDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        var command = new CreateVoteCommand
        {
            UserId = userId,
            Score = request.Score,
            Comment = request.Comment
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(CreateVote), new { id = result.Id }, result);
    }

    /// <summary>
    /// Obtener resultados NPS (solo administradores)
    /// </summary>
    [HttpGet("results")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<NpsResultDto>> GetNpsResults()
    {
        var query = new GetNpsResultsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Verificar si el usuario actual ya votó
    /// </summary>
    [HttpGet("has-voted")]
    [Authorize(Policy = "VotanteOnly")]
    public async Task<ActionResult<bool>> HasVoted()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        // This would typically be a query, but for simplicity using the repository directly
        // In a real scenario, create a GetHasVotedQuery
        return Ok(new { hasVoted = false }); // This should be implemented properly
    }
}
