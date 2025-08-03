using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;

namespace OpenCms.Persistence;

public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserOrganization> UserOrganizations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DataContext).Assembly);
    }
}
