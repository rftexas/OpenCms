using Vogen;

namespace OpenCms.Domain;

public class Tenant
{
    public TenantId TenantId { get; }
    public string Name { get; private set; }
    public string? Description { get; private set; }

    private Tenant(TenantId tenantId, string name, string? description = null)
    {
        TenantId = tenantId;
        Name = name;
        Description = description;
    }

    public class Builder
    {
        private Lazy<TenantId> tenantId = new(() => TenantId.From(Guid.NewGuid()));
        private string name = string.Empty;
        private string? description;

        public Builder WithTenantId(TenantId tenantId)
        {
            this.tenantId = new(() => tenantId);
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

        public Tenant Build()
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new InvalidOperationException("Tenant name is required.");
            }

            return new(tenantId.Value, name, description);
        }
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Tenant name cannot be empty.", nameof(name));
        }

        Name = name;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
    }
}

[ValueObject<Guid>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct TenantId
{
    private static Validation Validate(Guid input)
    {
        bool isValid = input != Guid.Empty;
        return isValid ? Validation.Ok : Validation.Invalid("TenantId cannot be Empty.");
    }
}
