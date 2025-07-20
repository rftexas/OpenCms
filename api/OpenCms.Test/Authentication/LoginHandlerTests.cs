using NSubstitute;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Core.Authentication.Commands;
using OpenCms.Persistence.Repositories;

namespace OpenCms.Test.Authentication
{
    public class LoginHandlerTests
    {
        [Fact]
        public async Task Handle_ReturnsUser_WhenCredentialsAreValid()
        {
            var email = Email.From("test@example.com");
            var userId = UserId.From(Guid.NewGuid());
            var user = new User.Builder()
                .WithUserId(userId)
                .WithEmail(email)
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            user.Credential.SetPassword("password123");

            var repo = Substitute.For<IUserRepository>();
            repo.GetByEmail(email).Returns(user);

            var handler = new LoginHandler(repo);
            var result = await handler.Handle(new Login(email, "password123"));

            Assert.NotNull(result);
            Assert.Equal(user, result);
        }

        [Fact]
        public async Task Handle_ReturnsNull_WhenUserDoesNotExist()
        {
            var email = Email.From("notfound@example.com");
            var repo = Substitute.For<IUserRepository>();
            repo.GetByEmail(email).Returns((User)null);

            var handler = new LoginHandler(repo);
            var result = await handler.Handle(new Login(email, "password123"));

            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_ReturnsNull_WhenPasswordIsIncorrect()
        {
            var email = Email.From("test@example.com");
            var userId = UserId.From(Guid.NewGuid());
            var user = new User.Builder()
                .WithUserId(userId)
                .WithEmail(email)
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            user.Credential.SetPassword("correctpassword");

            var repo = Substitute.For<IUserRepository>();
            repo.GetByEmail(email).Returns(user);

            var handler = new LoginHandler(repo);
            var result = await handler.Handle(new Login(email, "wrongpassword"));

            Assert.Null(result);
        }
    }
}
