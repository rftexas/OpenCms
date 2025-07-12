using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;

namespace OpenCms.Persistence.Repositories;

public interface IUserRepository : IRepository<UserId, User>
{
    Task<User?> GetByEmail(Email email);
}

public class UserRepository(DataContext dataContext) : IUserRepository
{
    public async Task<User> Create(User entity)
    {
        dataContext.Add(entity);

        await dataContext.SaveChangesAsync();

        return entity;
    }

    public async Task<User?> GetByEmail(Email email)
    {
        return await dataContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetById(UserId key)
    {
        return await dataContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == key);
    }

    public async Task<User> Update(User entity)
    {
        var userEntity = dataContext.Entry(entity);
        if (userEntity.State == EntityState.Detached)
        {
            userEntity.State = EntityState.Modified;
        }

        await dataContext.SaveChangesAsync();

        return entity;
    }
}