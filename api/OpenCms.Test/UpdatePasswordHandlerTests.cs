using NSubstitute;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Core.Authentication.Commands;
using OpenCms.Persistence.Repositories;
using OpenCms.Core.Notifications;

namespace OpenCms.Tests.Authentication
{
    public class UpdatePasswordHandlerTests
    {
        [Fact]
        public async Task Handle_WithPassword_UpdatesPassword_WhenOldPasswordIsCorrect()
        {
            var userId = UserId.From(Guid.NewGuid());
            var user = new User.Builder()
                .WithUserId(userId)
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            user.Credential.SetPassword("oldpass");

            var repo = Substitute.For<IUserRepository>();
            repo.GetById(userId).Returns(user);

            var handler = new UpdatePasswordHandler(repo, Substitute.For<ICommandHandler<SendEmail>>());
            await handler.Handle(new UpdatePassword.WithPassword(userId, "newpass", "oldpass"));

            Assert.True(user.Credential.ValidatePassword("newpass"));
        }

        [Fact]
        public async Task Handle_WithPassword_Throws_WhenOldPasswordIsIncorrect()
        {
            var userId = UserId.From(Guid.NewGuid());
            var user = new User.Builder()
                .WithUserId(userId)
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            user.Credential.SetPassword("oldpass");

            var repo = Substitute.For<IUserRepository>();
            repo.GetById(userId).Returns(user);

            var handler = new UpdatePasswordHandler(repo, Substitute.For<ICommandHandler<SendEmail>>());
            await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(new UpdatePassword.WithPassword(userId, "newpass", "wrongpass")));
        }

        [Fact]
        public async Task Handle_WithResetToken_UpdatesPassword_WhenTokenIsValid()
        {
            var tokenStr = Guid.NewGuid().ToString();
            var userId = UserId.From(Guid.NewGuid());
            var token = new PasswordResetToken.Builder()
                .WithUserId(userId)
                .WithToken(tokenStr)
                .WithExpiresAt(DateTime.UtcNow.AddHours(1))
                .WithUsed(false)
                .Build();
            var user = new User.Builder()
                .WithUserId(userId)
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            user.PasswordResetTokens.Add(token);
            user.Credential.SetPassword("oldpass");

            var repo = Substitute.For<IUserRepository>();
            repo.GetByPasswordResetToken(Arg.Any<PasswordResetToken>()).Returns(user);

            var sendEmailHandler = Substitute.For<ICommandHandler<SendEmail>>();
            var handler = new UpdatePasswordHandler(repo, sendEmailHandler);
            await handler.Handle(new UpdatePassword.WithResetToken(tokenStr, "newpass"));

            Assert.True(user.Credential.ValidatePassword("newpass"));
            Assert.True(user.PasswordResetTokens.First().Used);
            await sendEmailHandler.Received(1).Handle(Arg.Any<SendEmail>());
        }

        [Fact]
        public async Task Handle_WithResetToken_Throws_WhenTokenIsInvalid()
        {
            var repo = Substitute.For<IUserRepository>();
            repo.GetByPasswordResetToken(Arg.Any<PasswordResetToken>()).Returns((User)null);

            var handler = new UpdatePasswordHandler(repo, Substitute.For<ICommandHandler<SendEmail>>());
            var result = await handler.Handle(new UpdatePassword.WithResetToken("invalidtoken", "newpass"));
            Assert.False(result);
        }
    }
}
