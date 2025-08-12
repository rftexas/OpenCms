using OpenCms.Domain;

namespace OpenCms.Core.Organizations.Queries;

public record GetOrganizations : IQuery<GetOrganizationsResult>
{
    public string? SearchTerm { get; init; }
    public OrganizationStatus? Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public OrganizationSortBy SortBy { get; init; } = OrganizationSortBy.Name;
    public SortDirection SortDirection { get; init; } = SortDirection.Ascending;
    public OrganizationId? CurrentUserOrganizationId { get; init; }
    public bool IsSuperUser { get; init; }
}

public record GetOrganizationsResult
{
    public required IReadOnlyList<OrganizationListItem> Organizations { get; init; }
    public required int TotalCount { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
    public required int TotalPages { get; init; }
}

public record OrganizationListItem
{
    public required OrganizationId OrganizationId { get; init; }
    public required string Name { get; init; }
    public required string? Description { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required DateTime? UpdatedAt { get; init; }
    public required int UserCount { get; init; }
    public required int ActiveUserCount { get; init; }
}
