using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;
using OpenCms.Persistence;
using OpenCms.Persistence.Repositories;

namespace OpenCms.Test.Persistence;

public class OrganizationRepositoryTests
{
    private static DataContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task Create_AddsOrganizationToDatabase()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();

        var result = await repo.Create(org);
        Assert.NotNull(result);
        Assert.Equal(org.Name, result.Name);
        Assert.Single(context.Organizations);
    }

    [Fact]
    public async Task Update_UpdatesOrganizationInDatabase()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();
        await repo.Create(org);

        org.UpdateName("UpdatedOrg");
        var updated = await repo.Update(org);
        Assert.Equal("UpdatedOrg", updated.Name);
    }

    [Fact]
    public async Task GetById_ReturnsOrganization_WhenExists()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();
        await repo.Create(org);

        var found = await repo.GetById(org.OrganizationId);
        Assert.NotNull(found);
        Assert.Equal(org.OrganizationId, found.OrganizationId);
    }

    [Fact]
    public async Task GetById_ReturnsNull_WhenNotExists()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var found = await repo.GetById(OrganizationId.From(Guid.NewGuid()));
        Assert.Null(found);
    }

    [Fact]
    public async Task GetByNameAsync_ReturnsOrganization_WhenExists()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();
        await repo.Create(org);

        var found = await repo.GetByNameAsync("Org1");
        Assert.NotNull(found);
        Assert.Equal("Org1", found.Name);
    }

    [Fact]
    public async Task GetByNameAsync_ReturnsNull_WhenNotExists()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var found = await repo.GetByNameAsync("UnknownOrg");
        Assert.Null(found);
    }

    [Fact]
    public async Task IsNameUniqueAsync_ReturnsFalse_WhenNameExists()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();
        await repo.Create(org);

        var isUnique = await repo.IsNameUniqueAsync("Org1");
        Assert.False(isUnique);
    }

    [Fact]
    public async Task IsNameUniqueAsync_ReturnsTrue_WhenNameDoesNotExist()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var isUnique = await repo.IsNameUniqueAsync("UniqueOrg");
        Assert.True(isUnique);
    }

    [Fact]
    public async Task GetOrganizationsByUserIdAsync_ReturnsOrganizationsForUser()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var userId = UserId.From(Guid.NewGuid());
        var org = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .Build();
        var user = new User.Builder()
            .WithUserId(userId)
            .WithFirstName("Test")
            .WithEmail(Email.From("user@example.com"))
            .Build();
        org.UserOrganizations.Add(new UserOrganization.Builder()
            .WithUserId(userId)
            .WithRoleId(1) // Assuming role ID 1 exists
            .WithOrganizationId(org.OrganizationId)
            .Build());
        context.Organizations.Add(org);
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var orgs = await repo.GetOrganizationsByUserIdAsync(userId);
        Assert.Single(orgs);
        Assert.Equal("Org1", orgs[0].Name);
    }

    [Fact]
    public async Task GetFilteredOrganizationsAsync_FiltersByNameAndStatus()
    {
        var context = CreateInMemoryContext();
        var repo = new OrganizationRepository(context);
        var org1 = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org1")
            .WithIsActive(true)
            .Build();
        var org2 = new Organization.Builder()
            .WithOrganizationId(OrganizationId.From(Guid.NewGuid()))
            .WithName("Org2")
            .WithIsActive(false)
            .Build();
        await repo.Create(org1);
        await repo.Create(org2);

        var criteria = new OrganizationFilterCriteria
        {
            SearchTerm = "Org1",
            Status = OrganizationStatus.Active,
            Page = 1,
            PageSize = 10,
            SortBy = OrganizationSortBy.Name,
            SortDirection = SortDirection.Ascending
        };
        var result = await repo.GetFilteredOrganizationsAsync(criteria);
        Assert.Single(result.Organizations);
        Assert.Equal("Org1", result.Organizations[0].Name);
        Assert.Equal(1, result.TotalCount);
    }
}
