using OpenCms.Domain;
using OpenCms.Persistence.Repositories;

namespace OpenCms.Core.Organizations.Queries;

public class GetOrganizationsHandler : IQueryHandler<GetOrganizations, GetOrganizationsResult>
{
    private readonly IOrganizationRepository _organizationRepository;

    public GetOrganizationsHandler(IOrganizationRepository organizationRepository)
    {
        _organizationRepository = organizationRepository;
    }

    public async Task<GetOrganizationsResult> Handle(GetOrganizations query, CancellationToken cancellationToken)
    {
        // Build filter criteria
        var filterCriteria = new OrganizationFilterCriteria
        {
            SearchTerm = query.SearchTerm,
            Status = query.Status,
            CurrentUserOrganizationId = query.IsSuperUser ? null : query.CurrentUserOrganizationId,
            Page = query.Page,
            PageSize = query.PageSize,
            SortBy = query.SortBy,
            SortDirection = query.SortDirection
        };

        // Get filtered organizations
        var result = await _organizationRepository.GetFilteredOrganizationsAsync(filterCriteria, cancellationToken);

        // Map to result
        return new GetOrganizationsResult
        {
            Organizations = [.. result.Organizations.Select(org => new OrganizationListItem
            {
                OrganizationId = org.OrganizationId,
                Name = org.Name,
                Description = org.Description,
                IsActive = org.IsActive,
                CreatedAt = org.CreatedAt,
                UpdatedAt = org.UpdatedAt,
                UserCount = org.GetUserCount(),
                ActiveUserCount = org.GetActiveUserCount()
            })],
            TotalCount = result.TotalCount,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalPages = (int)Math.Ceiling((double)result.TotalCount / query.PageSize)
        };
    }
}
