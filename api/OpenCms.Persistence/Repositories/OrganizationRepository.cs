using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;

namespace OpenCms.Persistence.Repositories;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly DataContext _context;

    public OrganizationRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<Organization?> GetById(OrganizationId key)
    {
        return await _context.Organizations
            .Include(o => o.UserOrganizations)
                .ThenInclude(uo => uo.User)
            .Include(o => o.UserOrganizations)
                .ThenInclude(uo => uo.Role)
            .FirstOrDefaultAsync(o => o.OrganizationId == key);
    }

    public async Task<Organization> Update(Organization entity)
    {
        _context.Organizations.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Organization> Create(Organization entity)
    {
        _context.Organizations.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<FilteredOrganizationsResult> GetFilteredOrganizationsAsync(
        OrganizationFilterCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Organizations
            .Include(o => o.UserOrganizations)
                .ThenInclude(uo => uo.User)
            .AsQueryable();

        // Apply filtering based on user access
        if (criteria.CurrentUserOrganizationId.HasValue)
        {
            // Non-super users can only see their own organization
            query = query.Where(o => o.OrganizationId == criteria.CurrentUserOrganizationId.Value);
        }

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.Trim().ToLower();
            query = query.Where(o =>
                o.Name.ToLower().Contains(searchTerm) ||
                (o.Description != null && o.Description.ToLower().Contains(searchTerm)));
        }

        // Apply status filter
        if (criteria.Status.HasValue && criteria.Status != OrganizationStatus.All)
        {
            var isActive = criteria.Status == OrganizationStatus.Active;
            query = query.Where(o => o.IsActive == isActive);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = criteria.SortBy switch
        {
            OrganizationSortBy.Name => criteria.SortDirection == SortDirection.Ascending
                ? query.OrderBy(o => o.Name)
                : query.OrderByDescending(o => o.Name),
            OrganizationSortBy.CreatedAt => criteria.SortDirection == SortDirection.Ascending
                ? query.OrderBy(o => o.CreatedAt)
                : query.OrderByDescending(o => o.CreatedAt),
            OrganizationSortBy.UpdatedAt => criteria.SortDirection == SortDirection.Ascending
                ? query.OrderBy(o => o.UpdatedAt ?? o.CreatedAt)
                : query.OrderByDescending(o => o.UpdatedAt ?? o.CreatedAt),
            OrganizationSortBy.UserCount => criteria.SortDirection == SortDirection.Ascending
                ? query.OrderBy(o => o.UserOrganizations.Count)
                : query.OrderByDescending(o => o.UserOrganizations.Count),
            _ => query.OrderBy(o => o.Name)
        };

        // Apply pagination
        var organizations = await query
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToListAsync(cancellationToken);

        return new FilteredOrganizationsResult
        {
            Organizations = organizations,
            TotalCount = totalCount
        };
    }

    public async Task<Organization?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Organizations
            .FirstOrDefaultAsync(o => o.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<bool> IsNameUniqueAsync(
        string name,
        OrganizationId? excludeOrganizationId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Organizations
            .Where(o => o.Name.ToLower() == name.ToLower());

        if (excludeOrganizationId.HasValue)
        {
            query = query.Where(o => o.OrganizationId != excludeOrganizationId.Value);
        }

        return !await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Organization>> GetOrganizationsByUserIdAsync(
        UserId userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Organizations
            .Where(o => o.UserOrganizations.Any(uo => uo.UserId == userId))
            .Include(o => o.UserOrganizations)
                .ThenInclude(uo => uo.Role)
            .ToListAsync(cancellationToken);
    }
}
