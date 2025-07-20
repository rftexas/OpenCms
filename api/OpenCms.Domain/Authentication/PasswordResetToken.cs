namespace OpenCms.Domain.Authentication;

public class PasswordResetToken
{
    public long Id { get; }
    public UserId UserId { get; }
    public string Token { get; }
    public DateTime ExpiresAt { get; }
    public bool Used { get; private set; }

    private PasswordResetToken(long id, UserId userId, string token, DateTime expiresAt, bool used)
    {
        Id = id;
        UserId = userId;
        Token = token;
        ExpiresAt = expiresAt;
        Used = used;
    }

    public class Builder
    {
        private long id;
        private UserId userId;
        private string token = string.Empty;
        private DateTime expiresAt;
        private bool used = false;

        public Builder WithId(long id)
        {
            this.id = id;
            return this;
        }

        public Builder WithUserId(UserId userId)
        {
            this.userId = userId;
            return this;
        }

        public Builder WithToken(string token)
        {
            this.token = token;
            return this;
        }

        public Builder WithExpiresAt(DateTime expiresAt)
        {
            this.expiresAt = expiresAt;
            return this;
        }

        public Builder WithUsed(bool used)
        {
            this.used = used;
            return this;
        }

        public PasswordResetToken Build()
        {
            return new PasswordResetToken(id, userId, token, expiresAt, used);
        }
    }

    public void MarkAsUsed()
    {
        Used = true;
    }
}