namespace OpenCms.Persistence.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

public class IdentityTypeConfiguration : IEntityTypeConfiguration<IdentityType>
{
    public void Configure(EntityTypeBuilder<IdentityType> builder)
    {
        builder.ToTable("identity_type");

        builder.HasKey(x => x.IdentityTypeId);

        builder.Property(x => x.IdentityTypeId)
            .HasColumnName("identity_type_id")
            .HasConversion<IdentityTypeId.EfCoreValueConverter>()
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("identity_type_name")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .HasColumnName("identity_type_description")
            .HasMaxLength(255);
    }
}