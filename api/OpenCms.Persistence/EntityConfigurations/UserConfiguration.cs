namespace OpenCms.Persistence.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("user");

        builder.HasKey(x => x.UserId);

        builder.Property(x => x.UserId)
            .HasColumnName("user_id")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(x => x.FirstName)
            .HasColumnName("first_name")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(50);

        builder.OwnsOne(x => x.Credential, credential =>
        {
            credential.ToTable("user_credential");
            credential.WithOwner();

            credential.Property("UserId")
                .HasColumnName("user_id")
                .IsRequired();

            credential.Property(x => x.UserCredentialId)
                .HasColumnName("user_credential_id");

            credential.Property(x => x.PasswordHash)
                .HasColumnName("password_hash")
                .IsRequired();

            credential.Property(x => x.PasswordSalt)
                .HasColumnName("password_salt")
                .IsRequired();

            credential.Property(x => x.CreatedAt)
                .HasColumnName("created_at")
                .ValueGeneratedOnAdd()
                    .IsRequired();

            credential.Property(x => x.UpdatedAt)
                .HasColumnName("updated_at")
                .ValueGeneratedOnAddOrUpdate()
                .IsRequired();

            credential.Property(x => x.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true)
                .IsRequired();
        });

        builder.HasMany(x => x.PasswordResetTokens)
            .WithOne()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
