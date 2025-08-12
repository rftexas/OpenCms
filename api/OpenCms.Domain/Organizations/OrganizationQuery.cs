namespace OpenCms.Domain;

public record OrganizationFilterCriteria
{
    public string? SearchTerm { get; init; }
    public OrganizationStatus? Status { get; init; }
    public OrganizationId? CurrentUserOrganizationId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public OrganizationSortBy SortBy { get; init; } = OrganizationSortBy.Name;
    public SortDirection SortDirection { get; init; } = SortDirection.Ascending;
}

public record FilteredOrganizationsResult
{
    public required IReadOnlyList<Organization> Organizations { get; init; }
    public required int TotalCount { get; init; }
}

public enum OrganizationStatus
{
    All = 0,
    Active = 1,
    Inactive = 2
}

public enum OrganizationSortBy
{
    Name = 0,
    CreatedAt = 1,
    UserCount = 2,
    UpdatedAt = 3
}

public enum SortDirection
{
    Ascending = 0,
    Descending = 1
}
