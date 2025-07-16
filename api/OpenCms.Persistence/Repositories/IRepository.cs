namespace OpenCms.Persistence.Repositories;

/// <summary>
/// Simple Repository
/// </summary>
/// <typeparam name="TKey">The Unique Id for the Entity</typeparam>
/// <typeparam name="TEntity">The Entity</typeparam>
public interface IRepository<TKey, TEntity>
{

    /// <summary>
    /// Pulls a <typeparamref name="TEntity"/> from the store.
    /// </summary>
    /// <param name="key">The unique Identifier</param>
    /// <returns>A <typeparamref name="TEntity"/></returns> 
    Task<TEntity?> GetById(TKey key);

    /// <summary>
    /// Updates a <typeparamref name="TEntity"/> in the store.
    /// </summary>
    /// <param name="entity">The entity to update</param>
    /// <returns>A <typeparamref name="TEntity"/></returns> 
    Task<TEntity> Update(TEntity entity);

    /// <summary>
    /// Creates a <typeparamref name="TEntity"/> in the store.
    /// </summary>
    /// <param name="entity">The entity to create</param>
    /// <returns>A <typeparamref name="TEntity"/></returns> 
    Task<TEntity> Create(TEntity entity);
}