using NSubstitute;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Core.Authentication.Commands;
using OpenCms.Persistence.Repositories;
using OpenCms.Core.Notifications;

namespace OpenCms.Test.Authentication
{
    public class PasswordForgotHandlerTests
    {
        [Fact]
        public async Task Handle_ReturnsToken_AndSendsEmail_WhenUserExists()
        {
            var email = Email.From("test@example.com");
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(email)
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();

            var repo = Substitute.For<IUserRepository>();
            repo.GetByEmail(email).Returns(user);

            var sendEmailHandler = Substitute.For<ICommandHandler<SendEmail>>();
            var handler = new PasswordForgotHandler(repo, sendEmailHandler);
            var token = await handler.Handle(new PasswordForgot(email));

            Assert.NotNull(token);
            Assert.False(token.Used);
            Assert.NotEmpty(token.Token);
            Assert.NotEqual(Guid.Empty.ToString(), token.Token);
            Assert.InRange(token.ExpiresAt, DateTime.UtcNow, DateTime.UtcNow.AddHours(1));
            Assert.Contains(token, user.PasswordResetTokens);
            await sendEmailHandler.Received(1).Handle(Arg.Any<SendEmail>());
        }

        [Fact]
        public async Task Handle_ReturnsNull_AndDoesNotSendEmail_WhenUserDoesNotExist()
        {
            var email = Email.From("notfound@example.com");
            var repo = Substitute.For<IUserRepository>();
            repo.GetByEmail(email).Returns((User)null);

            var sendEmailHandler = Substitute.For<ICommandHandler<SendEmail>>();
            var handler = new PasswordForgotHandler(repo, sendEmailHandler);
            var token = await handler.Handle(new PasswordForgot(email));

            Assert.Null(token);
            await sendEmailHandler.DidNotReceive().Handle(Arg.Any<SendEmail>());
        }
    }
}
