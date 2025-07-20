namespace OpenCms.Core.Authentication.Commands;

using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Persistence.Repositories;

public class UpdatePassword
{
    public record WithPassword(UserId UserId, string NewPassword, string OldPassword) : ICommand;
    public record WithResetToken(string ResetToken, string NewPassword) : ICommand;
}

public class UpdatePasswordHandler(IUserRepository userRepository) : ICommandHandler<UpdatePassword.WithPassword>
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
    }

    public async Task Handle(UpdatePassword.WithResetToken command, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByPasswordResetToken(new PasswordResetToken.Builder().WithToken(command.ResetToken).Build());
        var token = user?.PasswordResetTokens.FirstOrDefault(t => t.Token == command.ResetToken && !t.Used);
        if (user is null || user.Credential is null || token is null)
        {
            throw new ArgumentException("Invalid or used reset token.");
        }

        user.Credential?.SetPassword(command.NewPassword);
        token.MarkAsUsed();

        await userRepository.Update(user);
    }
}