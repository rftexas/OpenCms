using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

namespace OpenCms.Persistence.EntityConfigurations;

public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> builder)
    {
        builder.ToTable("tenant");

        builder.HasKey(t => t.OrganizationId);

        builder.Property(t => t.OrganizationId)
            .HasColumnName("tenant_id")
            .HasConversion(
                v => v.Value,
                v => OrganizationId.From(v))
            .IsRequired();

        builder.Property(t => t.Name)
            .HasColumnName("tenant_name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("tenant_description")
            .HasMaxLength(255);

        builder.Property(t => t.IsActive)
            .HasColumnName("is_active")
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at");

        // Configure the UserOrganizations navigation property
        builder.HasMany(o => o.UserOrganizations)
            .WithOne(uo => uo.Organization)
            .HasForeignKey(uo => uo.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
