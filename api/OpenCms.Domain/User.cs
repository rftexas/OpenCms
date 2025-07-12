using OpenCms.Domain.Authentication;
using Vogen;

namespace OpenCms.Domain;

public class User
{
    public UserId UserId { get; }
    public Email Email { get; }
    public string FirstName { get; private set; }
    public string? LastName { get; private set; }
    public UserCredential? Credential { get; private set; }

    private User(UserId userId, Email email, string firstName, string? lastName)
    {
        UserId = userId; Email = email; FirstName = firstName; LastName = lastName;
    }

    public class Builder
    {
        private Lazy<UserId> userId = new(() => UserId.From(Guid.NewGuid()));
        private Email email;
        private Lazy<string> firstName = new(() => string.Empty);
        private Lazy<string?> lastName = new(() => null);
        private Lazy<UserCredential?> credential = new(() => null);

        public Builder WithUserId(UserId userId)
        {
            this.userId = new(() => userId);
            return this;
        }
        public Builder WithEmail(Email email)
        {
            this.email = email;
            return this;
        }

        public Builder WithFirstName(string firstName)
        {
            this.firstName = new(() => firstName);
            return this;
        }

        public Builder WithLastName(string lastName)
        {
            this.lastName = new(() => lastName);
            return this;
        }

        public Builder WithCredential(UserCredential credential)
        {
            this.credential = new(() => credential);
            return this;
        }

        public User Build()
        {
            if (string.IsNullOrEmpty(firstName.Value))
            {
                throw new InvalidOperationException("First Name is required for a User");
            }

            return new(userId.Value, email, firstName.Value, lastName.Value)
            {
                Credential = credential.Value
            };
        }
    }
}

[ValueObject<Guid>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct UserId
{
    private static Validation Validate(Guid input)
    {
        bool isValid = input != Guid.Empty;
        return isValid ? Validation.Ok : Validation.Invalid("UserId cannot be Empty.");
    }
}
