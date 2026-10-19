using System.ComponentModel.DataAnnotations;

namespace api_soccer.DTOs;

public class CreateLeagueHasTeamDto
{
    [Range(1, int.MaxValue)]
    public int League { get; set; }

    [Range(1, int.MaxValue)]
    public int Team { get; set; }
}