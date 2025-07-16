namespace OpenCms.Persistence.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

public class IdentityTypeConfiguration : IEntityTypeConfiguration<IdentityType>
{
    public void Configure(EntityTypeBuilder<IdentityType> builder)
    {
        builder.ToTable("IdentityTypes");

        builder.HasKey(x => x.IdentityTypeId);

        builder.Property(x => x.IdentityTypeId)
            .HasColumnName("identityTypeId")
            .HasConversion<IdentityTypeId.EfCoreValueConverter>()
            .IsRequired();

        builder.Property(x => x.Name)
            .HasColumnName("identityTypeName")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .HasColumnName("identityTypeDescription")
            .HasMaxLength(255);
    }
}