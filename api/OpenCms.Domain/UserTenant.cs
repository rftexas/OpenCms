namespace OpenCms.Domain;

public class UserTenant
{
    public UserId UserId { get; }
    public TenantId TenantId { get; }
    public short RoleId { get; }

    // Navigation properties
    public User? User { get; private set; }
    public Tenant? Tenant { get; private set; }
    public Role? Role { get; private set; }

    private UserTenant(UserId userId, TenantId tenantId, short roleId)
    {
        UserId = userId;
        TenantId = tenantId;
        RoleId = roleId;
    }

    public class Builder
    {
        private UserId userId;
        private TenantId tenantId;
        private short roleId;

        public Builder WithUserId(UserId userId)
        {
            this.userId = userId;
            return this;
        }

        public Builder WithTenantId(TenantId tenantId)
        {
            this.tenantId = tenantId;
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

        public UserTenant Build()
        {
            if (userId.Value == Guid.Empty)
            {
                throw new InvalidOperationException("UserId is required for UserTenant.");
            }

            if (tenantId.Value == Guid.Empty)
            {
                throw new InvalidOperationException("TenantId is required for UserTenant.");
            }

            if (roleId <= 0)
            {
                throw new InvalidOperationException("RoleId is required for UserTenant.");
            }

            return new(userId, tenantId, roleId);
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
