using OpenCms.Domain;

namespace OpenCms.Test.Domain
{
    public class UserOrganizationBuilderTests
    {
        [Fact]
        public void Build_Throws_When_UserId_Is_Empty()
        {
            var builder = new UserOrganization.Builder()
                .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
                .WithRoleId(1);
            Assert.Throws<InvalidOperationException>(() => builder.Build());
        }

        [Fact]
        public void Build_Throws_When_OrganizationId_Is_Empty()
        {
            var builder = new UserOrganization.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithRoleId(1);
            Assert.Throws<InvalidOperationException>(() => builder.Build());
        }

        [Fact]
        public void Build_Throws_When_RoleId_Is_Invalid()
        {
            var builder = new UserOrganization.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
                .WithRoleId(0);
            Assert.Throws<InvalidOperationException>(() => builder.Build());
        }

        [Fact]
        public void Build_Creates_UserOrganization_When_All_Fields_Valid()
        {
            var userId = UserId.From(Guid.NewGuid());
            var orgId = OrganizationId.From(Guid.NewGuid());
            short roleId = 2;
            var builder = new UserOrganization.Builder()
                .WithUserId(userId)
                .WithOrganizationId(orgId)
                .WithRoleId(roleId);
            var result = builder.Build();
            Assert.Equal(userId, result.UserId);
            Assert.Equal(orgId, result.OrganizationId);
            Assert.Equal(roleId, result.RoleId);
        }

        [Fact]
        public void WithRole_Sets_RoleId_From_Role()
        {
            var userId = UserId.From(Guid.NewGuid());
            var orgId = OrganizationId.From(Guid.NewGuid());
            var role = new Role.Builder().WithRoleId(5).WithName("TestRole").Build();
            var builder = new UserOrganization.Builder()
                .WithUserId(userId)
                .WithOrganizationId(orgId)
                .WithRole(role);
            var result = builder.Build();
            Assert.Equal(role.RoleId, result.RoleId);
        }
    }
}
