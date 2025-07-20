namespace OpenCms.Persistence.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<Domain.Authentication.PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<Domain.Authentication.PasswordResetToken> builder)
    {
        builder.ToTable("password_reset_token");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(x => x.Token)
            .HasColumnName("token")
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(x => x.Used)
            .HasColumnName("used")
            .HasDefaultValue(false)
            .IsRequired();
    }
}