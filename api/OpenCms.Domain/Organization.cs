using Vogen;

namespace OpenCms.Domain;

public class Organization
{
    public OrganizationId OrganizationId { get; }
    public string Name { get; private set; }
    public string? Description { get; private set; }

    protected Organization(OrganizationId organizationId, string name, string? description = null)
    {
        OrganizationId = organizationId;
        Name = name;
        Description = description;
    }

    public class Builder
    {
        private Lazy<OrganizationId> organizationId = new(() => OrganizationId.From(Guid.NewGuid()));
        private string name = string.Empty;
        private string? description;

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

        public Organization Build()
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new InvalidOperationException("Organization name is required.");
            }

            return new(organizationId.Value, name, description);
        }
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Organization name cannot be empty.", nameof(name));
        }

        Name = name;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
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
