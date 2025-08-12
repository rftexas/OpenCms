using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenCms.Core.Organizations.Queries;
using OpenCms.Domain;
using System.Security.Claims;

namespace OpenCms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrganizations(
        [FromServices] IQueryHandler<GetOrganizations, GetOrganizationsResult> handler,
        [FromQuery] string? searchTerm,
        [FromQuery] OrganizationStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] OrganizationSortBy sortBy = OrganizationSortBy.Name,
        [FromQuery] SortDirection sortDirection = SortDirection.Ascending)
    {
        // Get user context from claims
        var userIdClaim = User.FindFirst("userId")?.Value;
        var roleClaims = User.FindAll("role").Select(c => c.Value).ToList();
        var tenantClaim = User.FindFirst("tenant")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized();
        }

        var userId = UserId.From(Guid.Parse(userIdClaim));
        var isSuperUser = roleClaims.Contains(Role.WellKnownRoles.SuperUser);

        // For non-super users, limit to their own organization
        OrganizationId? currentUserOrganizationId = null;
        if (!isSuperUser && !string.IsNullOrEmpty(tenantClaim))
        {
            currentUserOrganizationId = OrganizationId.From(Guid.Parse(tenantClaim));
        }

        var query = new GetOrganizations
        {
            SearchTerm = searchTerm,
            Status = status,
            Page = Math.Max(1, page),
            PageSize = Math.Min(100, Math.Max(1, pageSize)), // Limit page size to prevent abuse
            SortBy = sortBy,
            SortDirection = sortDirection,
            CurrentUserOrganizationId = currentUserOrganizationId,
            IsSuperUser = isSuperUser
        };

        var result = await handler.Handle(query);

        return Ok(new
        {
            organizations = result.Organizations.Select(org => new
            {
                organizationId = org.OrganizationId.Value,
                name = org.Name,
                description = org.Description,
                isActive = org.IsActive,
                createdAt = org.CreatedAt,
                updatedAt = org.UpdatedAt,
                userCount = org.UserCount,
                activeUserCount = org.ActiveUserCount
            }),
            pagination = new
            {
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize,
                totalPages = result.TotalPages,
                hasNextPage = result.Page < result.TotalPages,
                hasPreviousPage = result.Page > 1
            }
        });
    }

    [HttpGet("{organizationId:guid}")]
    public async Task<IActionResult> GetOrganization(
        Guid organizationId,
        [FromServices] IQueryHandler<GetOrganizations, GetOrganizationsResult> handler)
    {
        // Get user context from claims
        var userIdClaim = User.FindFirst("userId")?.Value;
        var roleClaims = User.FindAll("role").Select(c => c.Value).ToList();
        var tenantClaim = User.FindFirst("tenant")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized();
        }

        var isSuperUser = roleClaims.Contains(Role.WellKnownRoles.SuperUser);
        var requestedOrgId = OrganizationId.From(organizationId);

        // Check if user has access to this organization
        if (!isSuperUser)
        {
            if (string.IsNullOrEmpty(tenantClaim) ||
                OrganizationId.From(Guid.Parse(tenantClaim)) != requestedOrgId)
            {
                return Forbid();
            }
        }

        var query = new GetOrganizations
        {
            Page = 1,
            PageSize = 1,
            CurrentUserOrganizationId = isSuperUser ? null : requestedOrgId,
            IsSuperUser = isSuperUser
        };

        var result = await handler.Handle(query);
        var organization = result.Organizations.FirstOrDefault(o => o.OrganizationId == requestedOrgId);

        if (organization == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            organizationId = organization.OrganizationId.Value,
            name = organization.Name,
            description = organization.Description,
            isActive = organization.IsActive,
            createdAt = organization.CreatedAt,
            updatedAt = organization.UpdatedAt,
            userCount = organization.UserCount,
            activeUserCount = organization.ActiveUserCount
        });
    }
}

public class GetOrganizationsRequest
{
    public string? SearchTerm { get; set; }
    public OrganizationStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public OrganizationSortBy SortBy { get; set; } = OrganizationSortBy.Name;
    public SortDirection SortDirection { get; set; } = SortDirection.Ascending;
}
