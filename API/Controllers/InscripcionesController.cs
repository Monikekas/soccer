using api_soccer.Data;
using api_soccer.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
namespace api_soccer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InscripcionController : ControllerBase
{
    private readonly SoccerDbContext _context;

    public InscripcionController(SoccerDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateLeagueHasTeam(
        CreateLeagueHasTeamDto dto)
    {
        var league = await _context.Leagues.FindAsync(dto.League);

        if (league is null)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga {dto.League}."
            });
        }

        var team = await _context.Teams.FindAsync(dto.Team);

        if (team is null)
        {
            return NotFound(new
            {
                message = $"No se encontró el equipo {dto.Team}."
            });
        }

        var inscription = new Inscripcion
        {
            League = dto.League,
            Team = dto.Team
        };

        _context.Set<Inscripcion>().Add(inscription);

        await _context.SaveChangesAsync();

        return Ok(inscription);
    }

    [HttpDelete("{league:int}/{team:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteLeagueHasTeam(
        int league,
        int team)
    {
        var inscription = await _context.Set<Inscripcion>()
            .FindAsync(league, team);

        if (inscription is null)
        {
            return NotFound(new
            {
                message = "No se encontró la inscripción."
            });
        }

        _context.Set<Inscripcion>().Remove(inscription);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    
    [HttpGet("{league:int}")]
    public async Task<IActionResult> GetTeamsByLeague(int league)
    {
        var leagueExists = await _context.Leagues
            .AnyAsync(item => item.Id == league);

        if (!leagueExists)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga {league}."
            });
        }

        var teams = await _context.Inscripciones
            .Where(inscripcion => inscripcion.League == league)
            .Join(
                _context.Teams,
                inscripcion => inscripcion.Team,
                team => team.Id,
                (inscripcion, team) => new
                {
                    team.Id,
                    team.Name,
                    team.Country,
                    team.PlayersQuantity,
                    team.Enabled
                }
            )
            .ToListAsync();

        return Ok(teams);
    }

    [Authorize]
    [HttpDelete("equipo/{team:int}")]
    public async Task<IActionResult> DeleteTeamInscripciones(int team)
    {
        var teamExists = await _context.Teams
            .AnyAsync(item => item.Id == team);

        if (!teamExists)
        {
            return NotFound(new
            {
                message = $"No se encontró el equipo {team}."
            });
        }

        var inscripciones = await _context.Inscripciones
            .Where(inscripcion => inscripcion.Team == team)
            .ToListAsync();

        if (inscripciones.Count == 0)
        {
            return Ok(new
            {
                message = "El equipo no tiene inscripciones.",
                eliminadas = 0
            });
        }

        _context.Inscripciones.RemoveRange(inscripciones);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Se eliminaron las inscripciones del equipo.",
            equipo = team,
            eliminadas = inscripciones.Count
        });
    }

    [Authorize]
    [HttpDelete("liga/{league:int}")]
    public async Task<IActionResult> DeleteLeagueInscripciones(int league)
    {
        var leagueExists = await _context.Leagues
            .AnyAsync(item => item.Id == league);

        if (!leagueExists)
        {
            return NotFound(new
            {
                message = $"No se encontró la liga {league}."
            });
        }

        var inscripciones = await _context.Inscripciones
            .Where(inscripcion => inscripcion.League == league)
            .ToListAsync();

        if (inscripciones.Count == 0)
        {
            return Ok(new
            {
                message = "La liga no tiene equipos inscritos.",
                eliminadas = 0
            });
        }

        _context.Inscripciones.RemoveRange(inscripciones);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Se eliminaron las inscripciones de la liga.",
            liga = league,
            eliminadas = inscripciones.Count
        });
    }

    
    [HttpGet]
    public async Task<IActionResult> GetInscripciones()
    {
        var leagues = await _context.Leagues
            .Select(league => new
            {
                league.Id,
                league.Name,
                league.Country,

                Teams = _context.Inscripciones
                    .Where(inscripcion => inscripcion.League == league.Id)
                    .Join(
                        _context.Teams,
                        inscripcion => inscripcion.Team,
                        team => team.Id,
                        (inscripcion, team) => new
                        {
                            team.Id,
                            team.Name
                        }
                    )
                    .ToList()
            })
            .ToListAsync();

        var result = leagues.Select(league => new
        {
            league.Id,
            league.Name,
            league.Country,
            Teams = league.Teams.Count == 0
                ? (object)0
                : league.Teams
        });

        return Ok(result);
    }
}