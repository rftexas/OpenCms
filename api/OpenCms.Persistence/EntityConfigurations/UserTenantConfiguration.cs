using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

namespace OpenCms.Persistence.EntityConfigurations;

public class UserTenantConfiguration : IEntityTypeConfiguration<UserTenant>
{
    public void Configure(EntityTypeBuilder<UserTenant> builder)
    {
        builder.ToTable("user_tenant");

        // Composite primary key
        builder.HasKey(ut => new { ut.UserId, ut.TenantId });

        builder.Property(ut => ut.UserId)
            .HasColumnName("user_id")
            .HasConversion(
                v => v.Value,
                v => UserId.From(v))
            .IsRequired();

        builder.Property(ut => ut.TenantId)
            .HasColumnName("tenant_id")
            .HasConversion(
                v => v.Value,
                v => TenantId.From(v))
            .IsRequired();

        builder.Property(ut => ut.RoleId)
            .HasColumnName("role_id")
            .IsRequired();

        // Navigation properties
        builder.HasOne(ut => ut.User)
            .WithMany(u => u.UserTenants)
            .HasForeignKey(ut => ut.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ut => ut.Tenant)
            .WithMany()
            .HasForeignKey(ut => ut.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ut => ut.Role)
            .WithMany()
            .HasForeignKey(ut => ut.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
