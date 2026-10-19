using Microsoft.EntityFrameworkCore;

namespace api_soccer.Data;

public class SoccerDbContext : DbContext
{
    public SoccerDbContext(DbContextOptions<SoccerDbContext> options)
        : base(options)
    {
    }

    public DbSet<League> Leagues => Set<League>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Inscripcion> Inscripciones => Set<Inscripcion>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Inscripcion>()
            .HasKey(x => new { x.League, x.Team });
    }
}
