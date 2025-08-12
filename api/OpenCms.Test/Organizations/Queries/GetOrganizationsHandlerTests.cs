using OpenCms.Core.Organizations.Queries;
using OpenCms.Domain;
using OpenCms.Persistence.Repositories;
using NSubstitute;

namespace OpenCms.Test.Organizations.Queries;

public class GetOrganizationsHandlerTests
{
    private readonly IOrganizationRepository _mockRepository;
    private readonly GetOrganizationsHandler _handler;

    public GetOrganizationsHandlerTests()
    {
        _mockRepository = Substitute.For<IOrganizationRepository>();
        _handler = new GetOrganizationsHandler(_mockRepository);
    }

    [Fact]
    public async Task Handle_WithValidQuery_ReturnsFilteredOrganizations()
    {
        // Arrange
        var orgId = OrganizationId.From(Guid.NewGuid());
        var org = new Organization.Builder()
            .WithOrganizationId(orgId)
            .WithName("Test Organization")
            .WithDescription("Test Description")
            .WithIsActive(true)
            .Build();

        var filterResult = new FilteredOrganizationsResult
        {
            Organizations = new List<Organization> { org },
            TotalCount = 1
        };

        _mockRepository.GetFilteredOrganizationsAsync(Arg.Any<OrganizationFilterCriteria>(), Arg.Any<CancellationToken>())
            .Returns(filterResult);

        var query = new GetOrganizations
        {
            Page = 1,
            PageSize = 10,
            IsSuperUser = true
        };

        // Act
        var result = await _handler.Handle(query, default);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result.Organizations);
        Assert.Equal(1, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(10, result.PageSize);
        Assert.Equal(1, result.TotalPages);

        var orgItem = result.Organizations.First();
        Assert.Equal(orgId, orgItem.OrganizationId);
        Assert.Equal("Test Organization", orgItem.Name);
        Assert.Equal("Test Description", orgItem.Description);
        Assert.True(orgItem.IsActive);
    }

    [Fact]
    public async Task Handle_WithSearchTerm_PassesCorrectFilterCriteria()
    {
        // Arrange
        var filterResult = new FilteredOrganizationsResult
        {
            Organizations = new List<Organization>(),
            TotalCount = 0
        };

        _mockRepository.GetFilteredOrganizationsAsync(Arg.Any<OrganizationFilterCriteria>(), Arg.Any<CancellationToken>())
            .Returns(filterResult);

        var query = new GetOrganizations
        {
            SearchTerm = "test search",
            Status = OrganizationStatus.Active,
            SortBy = OrganizationSortBy.Name,
            SortDirection = SortDirection.Descending,
            IsSuperUser = false,
            CurrentUserOrganizationId = OrganizationId.From(Guid.NewGuid())
        };

        // Act
        await _handler.Handle(query, default);

        // Assert
        await _mockRepository.Received(1).GetFilteredOrganizationsAsync(
            Arg.Is<OrganizationFilterCriteria>(criteria =>
                criteria.SearchTerm == "test search" &&
                criteria.Status == OrganizationStatus.Active &&
                criteria.SortBy == OrganizationSortBy.Name &&
                criteria.SortDirection == SortDirection.Descending &&
                criteria.CurrentUserOrganizationId == query.CurrentUserOrganizationId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithSuperUser_PassesNullCurrentUserOrganizationId()
    {
        // Arrange
        var filterResult = new FilteredOrganizationsResult
        {
            Organizations = new List<Organization>(),
            TotalCount = 0
        };

        _mockRepository.GetFilteredOrganizationsAsync(Arg.Any<OrganizationFilterCriteria>(), Arg.Any<CancellationToken>())
            .Returns(filterResult);

        var query = new GetOrganizations
        {
            IsSuperUser = true,
            CurrentUserOrganizationId = OrganizationId.From(Guid.NewGuid()) // This should be ignored
        };

        // Act
        await _handler.Handle(query, default);

        // Assert
        await _mockRepository.Received(1).GetFilteredOrganizationsAsync(
            Arg.Is<OrganizationFilterCriteria>(criteria =>
                criteria.CurrentUserOrganizationId == null),
            Arg.Any<CancellationToken>());
    }
}
