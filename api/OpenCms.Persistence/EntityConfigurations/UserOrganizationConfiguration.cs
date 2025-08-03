using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

namespace OpenCms.Persistence.EntityConfigurations;

public class UserOrganizationConfiguration : IEntityTypeConfiguration<UserOrganization>
{
    public void Configure(EntityTypeBuilder<UserOrganization> builder)
    {
        builder.ToTable("user_tenant");

        // Composite primary key
        builder.HasKey(ut => new { ut.UserId, ut.OrganizationId });

        builder.Property(ut => ut.UserId)
            .HasColumnName("user_id")
            .HasConversion(
                v => v.Value,
                v => UserId.From(v))
            .IsRequired();

        builder.Property(ut => ut.OrganizationId)
            .HasColumnName("tenant_id")
            .HasConversion(
                v => v.Value,
                v => OrganizationId.From(v))
            .IsRequired();

        builder.Property(ut => ut.RoleId)
            .HasColumnName("role_id")
            .IsRequired();

        // Navigation properties
        builder.HasOne(ut => ut.User)
            .WithMany(u => u.UserOrganizations)
            .HasForeignKey(ut => ut.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ut => ut.Organization)
            .WithMany()
            .HasForeignKey(ut => ut.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ut => ut.Role)
            .WithMany()
            .HasForeignKey(ut => ut.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
