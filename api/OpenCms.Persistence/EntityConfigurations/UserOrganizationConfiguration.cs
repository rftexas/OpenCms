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
        builder.HasKey(ut => new { ut.UserId, ut.OrganizationId, ut.RoleId });

        builder.Property(ut => ut.UserId)
            .HasColumnName("user_id")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(ut => ut.OrganizationId)
            .HasColumnName("tenant_id")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(ut => ut.RoleId)
            .HasColumnName("role_id")
            .IsRequired();

    }
}
