namespace OpenCms.Core.Authentication.Commands;

using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Persistence.Repositories;

public record PasswordForgot(Email Email) : ICommand<PasswordResetToken?>;

public class PasswordForgotHandler(IUserRepository userRepository) : ICommandHandler<PasswordForgot, PasswordResetToken?>
{
    public async Task<PasswordResetToken?> Handle(PasswordForgot command, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmail(command.Email);
        if (user is null)
        {
            return null; // User not found
        }

        var token = user.CreatePasswordResetToken();

        await userRepository.Update(user);
        return token;
    }
}