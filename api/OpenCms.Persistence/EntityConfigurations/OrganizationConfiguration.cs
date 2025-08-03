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
    }
}
