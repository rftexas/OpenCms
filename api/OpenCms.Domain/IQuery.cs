namespace OpenCms.Domain;

public interface IQuery<out TResult>
{
    // Marker interface for queries
}

public interface IQueryHandler<in TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    Task<TResult> Handle(TQuery query, CancellationToken cancellationToken = default);
}