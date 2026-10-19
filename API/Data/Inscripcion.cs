using System.ComponentModel.DataAnnotations.Schema;

namespace api_soccer.Data;

[Table("league_has_team")]
public class Inscripcion
{
    [Column("league")]
    public int League { get; set; }

    [Column("team")]
    public int Team { get; set; }
}