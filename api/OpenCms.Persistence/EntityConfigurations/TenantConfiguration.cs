using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

namespace OpenCms.Persistence.EntityConfigurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenant");

        builder.HasKey(t => t.TenantId);

        builder.Property(t => t.TenantId)
            .HasColumnName("tenant_id")
            .HasConversion(
                v => v.Value,
                v => TenantId.From(v))
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
