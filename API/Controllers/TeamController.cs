
using api_soccer.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_soccer.DTOs;
using Microsoft.AspNetCore.Authorization;
namespace api_soccer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly SoccerDbContext _context;

    public TeamsController(SoccerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var teams = await _context.Teams.ToListAsync();

        return Ok(teams);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTeamsById(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team is null)
        {
            return NotFound(new
            {
                message = $"No se encontró el equipo con id {id}."
            });
        }

        return Ok(team);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchTeams(
        [FromQuery] string? name,
        [FromQuery] int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Ok(new List<object>());
        }

        var search = name.Trim();

        var query = _context.Teams
            .Where(team => EF.Functions.Like(team.Name, $"%{search}%"));

        if (excludeId.HasValue)
        {
            query = query.Where(team => team.Id != excludeId.Value);
        }

        var matches = await query
            .OrderBy(team => team.Name)
            .Select(team => new
            {
                team.Id,
                team.Name
            })
            .Take(10)
            .ToListAsync();

        return Ok(matches);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTeam(TeamDto dto)
    {
        var name = dto.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "El nombre del equipo es obligatorio."
            });
        }

        var normalizedName = name.ToLower();

        var duplicateExists = await _context.Teams
            .AnyAsync(team =>
                team.Name.Trim().ToLower() == normalizedName);

        if (duplicateExists)
        {
            return Conflict(new
            {
                message = $"Ya existe un equipo con el nombre '{name}'."
            });
        }

        var team = new Team
        {
            Name = name,
            Country = dto.Country,
            PlayersQuantity = dto.PlayersQuantity,
            Enabled = true
        };

        _context.Teams.Add(team);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTeamsById),
            new { id = team.Id },
            team
        );
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTeam(
        int id,
        TeamDto dto)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team is null)
        {
            return NotFound(new
            {
                message = $"No se encontró el equipo con id {id}."
            });
        }

        var name = dto.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                message = "El nombre del equipo es obligatorio."
            });
        }

        var normalizedName = name.ToLower();

        var duplicateExists = await _context.Teams
            .AnyAsync(other =>
                other.Id != id &&
                other.Name.Trim().ToLower() == normalizedName);

        if (duplicateExists)
        {
            return Conflict(new
            {
                message = $"Ya existe otro equipo con el nombre '{name}'."
            });
        }

        team.Name = name;
        team.Country = dto.Country;
        team.PlayersQuantity = dto.PlayersQuantity;
        team.Enabled = dto.Enabled;

        await _context.SaveChangesAsync();

        return Ok(team);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team is null)
        {
            return NotFound(new
            {
                message = $"No se encontró el equipo con id {id}."
            });
        }

        _context.Teams.Remove(team);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
