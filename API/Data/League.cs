using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_soccer.Data;

[Table("league")]
public class League
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name", TypeName = "varchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("country", TypeName = "varchar(100)")]
    public string Country { get; set; } = string.Empty;

    [Column("start_date", TypeName = "datetime2")]
    public DateTime StartDate { get; set; }

    [Column("end_date", TypeName = "datetime2")]
    public DateTime EndDate { get; set; }

    [Column("enabled")]
    public bool Enabled { get; set; }
}
