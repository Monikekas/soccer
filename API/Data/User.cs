using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api_soccer.Data;

[Table("user")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user", TypeName = "varchar(100)")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Column("pwd_hash", TypeName = "varchar(255)")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    public int RoleId { get; set; }

    [ForeignKey(nameof(RoleId))]
    public Role? UserRole { get; set; }
}