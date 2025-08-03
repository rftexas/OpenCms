namespace OpenCms.Core.Authentication.Commands;

using OpenCms.Core.Notifications;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Persistence.Repositories;

public record PasswordForgot(Email Email) : ICommand<PasswordResetToken?>;

public class PasswordForgotHandler(IUserRepository userRepository, ICommandHandler<SendEmail> handler) : ICommandHandler<PasswordForgot, PasswordResetToken?>
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

        var resetLink = $"https://localhost:1234/reset-password?token={token.Token}&email={command.Email.Value}";
        var emailCommand = new SendEmail(
            user.Email,
            "Password Reset Request",
            $"<p>To reset your password, please click the link below:</p><p><a href=\"{resetLink}\">Reset Password</a></p>"
        );
        await handler.Handle(emailCommand, cancellationToken);
        return token;
    }
}