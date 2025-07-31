using OpenCms.Domain;
using OpenCms.Persistence.Repositories;

namespace OpenCms.Core.Authentication.Commands;

public record Login(Email Email, string Password) : IQuery<User?>;


public class LoginHandler(IUserRepository userRepository) : IQueryHandler<Login, User?>
{
    public async Task<User?> Handle(Login query, CancellationToken cancellationToken = default)
    {
        var isValid = false;
        var user = await userRepository.GetByEmailWithTenants(query.Email);
        isValid = user is not null && user.Credential is not null &&
            user.Credential.ValidatePassword(query.Password);

        return isValid ? user : null;
    }
}