using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;

namespace OpenCms.Persistence.Repositories;

public interface IUserRepository : IRepository<UserId, User>
{
    Task<User?> GetByEmail(Email email);
    Task<User?> GetByEmailWithTenants(Email email);
    Task<User?> GetByPasswordResetToken(PasswordResetToken token);
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
        return await dataContext.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByEmailWithTenants(Email email)
    {
        return await dataContext.Users
            .Include(u => u.UserOrganizations)
            .ThenInclude(ut => ut.Role)
            .Include(u => u.UserOrganizations)
            .ThenInclude(ut => ut.Organization)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetById(UserId key)
    {
        return await dataContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == key);
    }

    public Task<User?> GetByPasswordResetToken(PasswordResetToken token)
    {
        return dataContext.Users.Include(u => u.PasswordResetTokens).Include(u => u.Credential)
            .FirstOrDefaultAsync(u => u.PasswordResetTokens.Any(t => t.Token == token.Token && !t.Used));
    }

    public async Task<User> Update(User entity)
    {
        var userEntity = dataContext.Entry(entity);
        if (userEntity.State == EntityState.Detached)
        {
            userEntity.State = EntityState.Modified;
            dataContext.Entry(entity.Credential).State = EntityState.Modified;
        }

        await dataContext.SaveChangesAsync();

        return entity;
    }
}