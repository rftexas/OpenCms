namespace OpenCms.Domain;

public class Role
{
    public short RoleId { get; }
    public string Name { get; private set; }
    public string? Description { get; private set; }

    private Role(short roleId, string name, string? description = null)
    {
        RoleId = roleId;
        Name = name;
        Description = description;
    }

    public class Builder
    {
        private short roleId;
        private string name = string.Empty;
        private string? description;

        public Builder WithRoleId(short roleId)
        {
            this.roleId = roleId;
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

        public Role Build()
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new InvalidOperationException("Role name is required.");
            }

            return new(roleId, name, description);
        }
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Role name cannot be empty.", nameof(name));
        }

        Name = name;
    }

    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    // Common role constants for easy reference
    public static class WellKnownRoles
    {
        public const string SuperUser = "Super User";
        public const string Administrator = "Administrator";
        public const string Investigator = "Investigator";
        public const string Reviewer = "Reviewer";
        public const string Reporter = "Reporter";
    }
}
