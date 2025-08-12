namespace OpenCms.Domain;

public class UserOrganization
{
    public UserId UserId { get; }
    public OrganizationId OrganizationId { get; }
    public short RoleId { get; }

    // Navigation properties
    public virtual User User { get; private set; }
    public virtual Organization Organization { get; private set; }
    public virtual Role Role { get; private set; }

    protected UserOrganization(UserId userId, OrganizationId organizationId, short roleId)
    {
        UserId = userId;
        OrganizationId = organizationId;
        RoleId = roleId;
    }

    public static Builder CreateBuilder()
    {
        return new Builder();
    }

    public class Builder
    {
        private UserId? userId;
        private OrganizationId? organizationId;
        private short roleId;

        public Builder WithUserId(UserId userId)
        {
            this.userId = userId;
            return this;
        }

        public Builder WithOrganizationId(OrganizationId organizationId)
        {
            this.organizationId = organizationId;
            return this;
        }

        public Builder WithRoleId(short roleId)
        {
            this.roleId = roleId;
            return this;
        }

        public Builder WithRole(Role role)
        {
            this.roleId = role.RoleId;
            return this;
        }

        public UserOrganization Build()
        {
            if (userId is null)
            {
                throw new InvalidOperationException("UserId is required for UserOrganization.");
            }

            if (organizationId is null)
            {
                throw new InvalidOperationException("OrganizationId is required for UserOrganization.");
            }

            if (roleId <= 0)
            {
                throw new InvalidOperationException("RoleId is required for UserOrganization.");
            }

            return new(userId.Value, organizationId.Value, roleId);
        }
    }

    // Helper methods for role checking
    public bool IsInRole(string roleName)
    {
        return Role?.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase) == true;
    }

    public bool IsSuperUser()
    {
        return IsInRole(Role.WellKnownRoles.SuperUser);
    }

    public bool IsAdministrator()
    {
        return IsInRole(Role.WellKnownRoles.Administrator);
    }

    public bool IsInvestigator()
    {
        return IsInRole(Role.WellKnownRoles.Investigator);
    }

    public bool IsReviewer()
    {
        return IsInRole(Role.WellKnownRoles.Reviewer);
    }

    public bool IsReporter()
    {
        return IsInRole(Role.WellKnownRoles.Reporter);
    }
}
