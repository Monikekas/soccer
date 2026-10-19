
using System.ComponentModel.DataAnnotations;

namespace api_soccer.DTOs;

public class TeamDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Country { get; set; } = string.Empty;

    [Range(11, 22)]
    public int PlayersQuantity { get; set; }
    
    public bool Enabled { get; set; }
}