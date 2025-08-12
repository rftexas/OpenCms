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
    public HashSet<PasswordResetToken> PasswordResetTokens { get; } = new();
    public virtual HashSet<UserOrganization> UserOrganizations { get; } = new();

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

    public PasswordResetToken CreatePasswordResetToken()
    {
        if (Credential == null)
        {
            throw new InvalidOperationException("User does not have a credential to create a password reset token.");
        }

        var token = new PasswordResetToken.Builder()
            .WithUserId(UserId)
            .WithToken(Guid.NewGuid().ToString())
            .WithExpiresAt(DateTime.UtcNow.AddHours(1))
            .Build();

        PasswordResetTokens.Add(token);
        return token;
    }

    public void SetName(string firstName, string? lastName = null)
    {
        if (string.IsNullOrEmpty(firstName))
        {
            throw new ArgumentException("First name cannot be empty.", nameof(firstName));
        }

        FirstName = firstName;
        LastName = lastName;
    }

    // Organization and Role helper methods
    public IEnumerable<Organization> GetOrganizations()
    {
        return UserOrganizations.Where(uo => uo.Organization != null).Select(uo => uo.Organization!);
    }

    public IEnumerable<Role> GetRoles()
    {
        return UserOrganizations.Where(uo => uo.Role != null).Select(uo => uo.Role!).Distinct();
    }

    public IEnumerable<string> GetRoleNames()
    {
        return GetRoles().Select(r => r.Name);
    }

    public bool HasRole(string roleName)
    {
        return UserOrganizations.Any(uo => uo.IsInRole(roleName));
    }

    public bool IsSuperUser()
    {
        return UserOrganizations.Any(uo => uo.IsSuperUser());
    }

    public bool IsAdministrator()
    {
        return UserOrganizations.Any(uo => uo.IsAdministrator());
    }

    public bool IsInvestigator()
    {
        return UserOrganizations.Any(uo => uo.IsInvestigator());
    }

    public bool IsReviewer()
    {
        return UserOrganizations.Any(uo => uo.IsReviewer());
    }

    public bool HasAccessToOrganization(OrganizationId organizationId)
    {
        return UserOrganizations.Any(uo => uo.OrganizationId == organizationId);
    }

    public Role? GetRoleForOrganization(OrganizationId organizationId)
    {
        return UserOrganizations.FirstOrDefault(uo => uo.OrganizationId == organizationId)?.Role;
    }


    public string GetPrimaryRoleName()
    {
        // Super User takes precedence
        if (IsSuperUser()) return Role.WellKnownRoles.SuperUser;
        if (IsAdministrator()) return Role.WellKnownRoles.Administrator;
        if (IsInvestigator()) return Role.WellKnownRoles.Investigator;
        if (IsReviewer()) return Role.WellKnownRoles.Reviewer;

        // Fallback to first role or Reporter
        return GetRoleNames().FirstOrDefault() ?? Role.WellKnownRoles.Reporter;
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
