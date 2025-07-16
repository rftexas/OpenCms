namespace OpenCms.Persistence.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OpenCms.Domain;

public class UserConfiguration : IEntityTypeConfiguration<OpenCms.Domain.User>
{
    public void Configure(EntityTypeBuilder<OpenCms.Domain.User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.UserId);

        builder.Property(x => x.UserId)
            .HasColumnName("userId")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasVogenConversion()
            .IsRequired();

        builder.Property(x => x.FirstName)
            .HasColumnName("firstName")
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.LastName)
            .HasColumnName("lastName")
            .HasMaxLength(50);

        builder.OwnsOne(x => x.Credential, credential =>
        {
            credential.ToTable("userCredential");
            credential.WithOwner();

            credential.Property("UserId")
                .HasColumnName("userId")
                .IsRequired();

            credential.Property(x => x.UserCredentialId)
                .HasColumnName("userCredentialId");

            credential.Property(x => x.PasswordHash)
                .HasColumnName("passwordHash")
                .IsRequired();

            credential.Property(x => x.PasswordSalt)
                .HasColumnName("passwordSalt")
                .IsRequired();

            credential.Property(x => x.CreatedAt)
                .HasColumnName("createdAt")
                .ValueGeneratedOnAdd()
                    .IsRequired();

            credential.Property(x => x.UpdatedAt)
                .HasColumnName("updatedAt")
                .ValueGeneratedOnAddOrUpdate()
                .IsRequired();

            credential.Property(x => x.IsActive)
                .HasColumnName("isActive")
                .HasDefaultValue(true)
                .IsRequired();
        });
    }
}