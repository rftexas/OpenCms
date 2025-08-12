using Vogen;

namespace OpenCms.Domain;

public class Organization
{
    public OrganizationId OrganizationId { get; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Navigation properties
    public HashSet<UserOrganization> UserOrganizations { get; } = new();

    protected Organization(OrganizationId organizationId, string name, string? description = null, bool isActive = true)
    {
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        IsActive = isActive;
        CreatedAt = DateTime.UtcNow;
    }

    public class Builder
    {
        private Lazy<OrganizationId> organizationId = new(() => OrganizationId.From(Guid.NewGuid()));
        private string name = string.Empty;
        private string? description;
        private bool isActive = true;

        public Builder WithOrganizationId(OrganizationId organizationId)
        {
            this.organizationId = new(() => organizationId);
            return this;
        }

        public Builder WithName(string name)
        {
            this.name = name;
            return this;
        }

        public Builder WithDescription(string? description)
        {
            this.description = description;
            return this;
        }

        public Builder WithIsActive(bool isActive)
        {
            this.isActive = isActive;
            return this;
        }

        public Organization Build()
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new InvalidOperationException("Organization name is required.");
            }

            return new(organizationId.Value, name, description, isActive);
        }
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Organization name cannot be empty.", nameof(name));
        }

        Name = name;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public int GetUserCount()
    {
        return UserOrganizations.Count;
    }

    public int GetActiveUserCount()
    {
        return UserOrganizations.Count(uo => uo.User != null);
    }
}

[ValueObject<Guid>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct OrganizationId
{
    private static Validation Validate(Guid input)
    {
        bool isValid = input != Guid.Empty;
        return isValid ? Validation.Ok : Validation.Invalid("OrganizationId cannot be Empty.");
    }
}
