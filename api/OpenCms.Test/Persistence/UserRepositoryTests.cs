using Microsoft.EntityFrameworkCore;
using OpenCms.Domain;
using OpenCms.Domain.Authentication;
using OpenCms.Persistence;
using OpenCms.Persistence.Repositories;

namespace OpenCms.Test.Persistence
{
    public class UserRepositoryTests
    {
        private DataContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new DataContext(options);
        }

        [Fact]
        public async Task Create_AddsUserToDatabase()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();

            var result = await repo.Create(user);
            Assert.NotNull(result);
            Assert.Equal(user.Email, result.Email);
            Assert.Single(context.Users);
        }

        [Fact]
        public async Task GetByEmail_ReturnsUser_WhenExists()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            await repo.Create(user);

            var found = await repo.GetByEmail(user.Email);
            Assert.NotNull(found);
            Assert.Equal(user.Email, found.Email);
        }

        [Fact]
        public async Task GetByEmail_ReturnsNull_WhenNotExists()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var found = await repo.GetByEmail(Email.From("notfound@example.com"));
            Assert.Null(found);
        }

        [Fact]
        public async Task GetById_ReturnsUser_WhenExists()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            await repo.Create(user);

            var found = await repo.GetById(user.UserId);
            Assert.NotNull(found);
            Assert.Equal(user.UserId, found.UserId);
        }

        [Fact]
        public async Task GetById_ReturnsNull_WhenNotExists()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var found = await repo.GetById(UserId.From(Guid.NewGuid()));
            Assert.Null(found);
        }

        [Fact]
        public async Task GetByPasswordResetToken_ReturnsUser_WhenTokenIsValid()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            var token = new PasswordResetToken.Builder()
                .WithUserId(user.UserId)
                .WithToken("token123")
                .WithExpiresAt(DateTime.UtcNow.AddHours(1))
                .WithUsed(false)
                .Build();
            user.PasswordResetTokens.Add(token);
            await repo.Create(user);

            var found = await repo.GetByPasswordResetToken(token);
            Assert.NotNull(found);
            Assert.Equal(user.UserId, found.UserId);
        }

        [Fact]
        public async Task GetByPasswordResetToken_ReturnsNull_WhenTokenIsInvalid()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var token = new PasswordResetToken.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithToken("badtoken")
                .WithExpiresAt(DateTime.UtcNow.AddHours(1))
                .WithUsed(false)
                .Build();
            var found = await repo.GetByPasswordResetToken(token);
            Assert.Null(found);
        }

        [Fact]
        public async Task Update_UpdatesUserInDatabase()
        {
            var context = CreateInMemoryContext();
            var repo = new UserRepository(context);
            var user = new User.Builder()
                .WithUserId(UserId.From(Guid.NewGuid()))
                .WithEmail(Email.From("test@example.com"))
                .WithFirstName("Test")
                .WithCredential(new UserCredential())
                .Build();
            await repo.Create(user);

            user.SetName("Updated");
            var updated = await repo.Update(user);
            Assert.Equal("Updated", updated.FirstName);
        }
    }
}
