namespace OpenCms.Core.Authentication.Commands;

using OpenCms.Core.Notifications;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Persistence.Repositories;

public class UpdatePassword
{
    public record WithPassword(UserId UserId, string NewPassword, string OldPassword) : ICommand;
    public record WithResetToken(string ResetToken, string NewPassword) : ICommand<bool>;
}

public class UpdatePasswordHandler(IUserRepository userRepository, ICommandHandler<SendEmail> handler) : ICommandHandler<UpdatePassword.WithPassword>, ICommandHandler<UpdatePassword.WithResetToken, bool>
{
    public async Task Handle(UpdatePassword.WithPassword command, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetById(command.UserId);
        if (user is null)
        {
            throw new ArgumentException("User not found.");
        }

        if (user.Credential is null || !user.Credential.ValidatePassword(command.OldPassword))
        {
            throw new ArgumentException("Old password is incorrect.");
        }

        user.Credential?.SetPassword(command.NewPassword);
        await userRepository.Update(user);

        await handler.Handle(new SendEmail(
            user.Email,
            "Password Reset Confirmation",
            "<p>Your password has been successfully reset.</p>"
        ), cancellationToken);
    }

    public async Task<bool> Handle(UpdatePassword.WithResetToken command, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByPasswordResetToken(new PasswordResetToken.Builder().WithToken(command.ResetToken).Build());
        var token = user?.PasswordResetTokens.FirstOrDefault(t => t.Token == command.ResetToken && !t.Used);
        if (user is null || user.Credential is null || token is null)
        {
            return false;
        }

        user.Credential?.SetPassword(command.NewPassword);
        token.MarkAsUsed();

        await userRepository.Update(user);

        await handler.Handle(new SendEmail(
            user.Email,
            "Password Reset Confirmation",
            "<p>Your password has been successfully reset.</p>"
        ), cancellationToken);
        return true;
    }
}