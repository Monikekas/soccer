
using api_soccer.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api_soccer.DTOs;
namespace api_soccer.Controllers;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class LeaguesController : ControllerBase
{
    private readonly SoccerDbContext _context;

    public LeaguesController(SoccerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLeagues()
    {
        var leagues = await _context.Leagues.ToListAsync();

        return Ok(leagues);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetLeagueById(int id)
    {
        var league = await _context.Leagues.FindAsync(id);

        if (league is null)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga con id {id}."
            });
        }

        return Ok(league);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateLeague(
        LeagueDto dto)
    {
        if (dto.EndDate < dto.StartDate)
        {
            return BadRequest(new
            {
                message = "La fecha de fin no puede ser anterior a la fecha de inicio."
            });
        }

        var league = new League
        {
            Name = dto.Name,
            Country = dto.Country,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Enabled = true
        };

        _context.Leagues.Add(league);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetLeagues),
            new { id = league.Id },
            league
        );
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateLeague(
        int id,
        LeagueDto dto)
    {
        if (dto.EndDate < dto.StartDate)
        {
            return BadRequest(new
            {
                message = "La fecha de fin no puede ser anterior a la fecha de inicio."
            });
        }

        var league = await _context.Leagues.FindAsync(id);

        if (league is null)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga con id {id}."
            });
        }

        league.Name = dto.Name;
        league.Country = dto.Country;
        league.StartDate = dto.StartDate;
        league.EndDate = dto.EndDate;
        league.Enabled = dto.Enabled;

        await _context.SaveChangesAsync();

        return Ok(league);
    }
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLeague(int id)
    {
        var league = await _context.Leagues.FindAsync(id);

        if (league is null)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga con id {id}."
            });
        }

        _context.Leagues.Remove(league);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    

}
