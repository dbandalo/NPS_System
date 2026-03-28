using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NPS.Application.DTOs;
using NPS.Application.Features.Votes.Queries;

namespace NPS.API.Controllers;

/// <summary>
/// Rutas alineadas con la especificación DEV-001 / material de referencia (GET /api/nps/result).
/// La lógica es la misma que GET /api/votes/results.
/// </summary>
[ApiController]
[Route("api/nps")]
[Authorize(Policy = "AdminOnly")]
public class NpsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NpsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("result")]
    public async Task<ActionResult<NpsResultDto>> GetResult()
    {
        var result = await _mediator.Send(new GetNpsResultsQuery());
        return Ok(result);
    }
}
