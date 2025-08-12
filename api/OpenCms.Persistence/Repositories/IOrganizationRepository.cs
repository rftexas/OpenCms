using OpenCms.Domain;

namespace OpenCms.Persistence.Repositories;

public interface IOrganizationRepository : IRepository<OrganizationId, Organization>
{
    /// <summary>
    /// Gets organizations with filtering, sorting, and pagination
    /// </summary>
    /// <param name="criteria">Filter criteria</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Filtered organizations result</returns>
    Task<FilteredOrganizationsResult> GetFilteredOrganizationsAsync(
        OrganizationFilterCriteria criteria,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an organization by name (case-insensitive)
    /// </summary>
    /// <param name="name">Organization name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Organization if found, null otherwise</returns>
    Task<Organization?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an organization name is unique (case-insensitive)
    /// </summary>
    /// <param name="name">Organization name to check</param>
    /// <param name="excludeOrganizationId">Organization ID to exclude from check (for updates)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if name is unique, false otherwise</returns>
    Task<bool> IsNameUniqueAsync(
        string name,
        OrganizationId? excludeOrganizationId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all organizations that a user has access to
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of organizations the user belongs to</returns>
    Task<IReadOnlyList<Organization>> GetOrganizationsByUserIdAsync(
        UserId userId,
        CancellationToken cancellationToken = default);
}
