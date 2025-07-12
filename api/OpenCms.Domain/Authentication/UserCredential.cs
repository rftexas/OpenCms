using System.Security.Cryptography;

namespace OpenCms.Domain.Authentication;

public class UserCredential
{
    private const int HashSize = 32; // Size of the hash in bytes
    private const int SaltSize = 16; // Size of the salt in bytes
    private const int Iterations = 100_000; // Number of iterations for PBKDF2
    public Guid UserCredentialId { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; }

    public bool ValidatePassword(string password)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, PasswordSalt, Iterations, HashAlgorithmName.SHA256);
        var computedHash = pbkdf2.GetBytes(HashSize);

        return CryptographicOperations.FixedTimeEquals(computedHash, PasswordHash);
    }

    public void SetPassword(string newPassword)
    {
        PasswordSalt = new byte[SaltSize];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(PasswordSalt);

        using var pbkdf2 = new Rfc2898DeriveBytes(newPassword, PasswordSalt, Iterations, HashAlgorithmName.SHA256);
        PasswordHash = pbkdf2.GetBytes(HashSize);
    }
}