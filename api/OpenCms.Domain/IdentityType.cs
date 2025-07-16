using Vogen;

namespace OpenCms.Domain;

public class IdentityType
{
    public IdentityTypeId IdentityTypeId { get; private set; }

    public string Name { get; private set; }
    public string? Description { get; private set; }

    public IdentityType(IdentityTypeId identityTypeId, string name, string? description)
    {
        IdentityTypeId = identityTypeId;
        Name = name;
        Description = description;
    }

}

[ValueObject<short>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct IdentityTypeId
{

}