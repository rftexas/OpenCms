# Architectural Decision Record: Start with Application Accounts

## Status

Accepted

## Context

The Case Management System (CMS) requires a way to manage user authentication and authorization. There are several options for identity management, including integrating with external identity providers (e.g., SSO, OAuth, Keycloak) or managing user accounts internally within the application.

For the initial phase, the team needs a simple, reliable, and fast-to-implement solution to allow users (administrators, investigators, reviewers, etc.) to log in and manage their accounts.

## Decision

We will start with **application-managed user accounts** for authentication and authorization. User credentials and profiles will be stored and managed within the CMS database.

## Consequences

- Enables rapid development and onboarding of users without external dependencies.
- Simplifies initial deployment and testing.
- User management (registration, password reset, roles) will be handled by the application.
- Security best practices (password hashing, account lockout, etc.) must be implemented and maintained internally.
- Future migration to an external identity provider (e.g., Keycloak, SSO) will require a data migration and refactoring of authentication logic.

## Alternatives Considered

- **External Identity Provider (e.g., Keycloak, SSO)**: More scalable and secure for enterprise use, but adds complexity and setup time not needed for the initial phase.
- **Social Login (Google, Microsoft, etc.)**: Convenient for some users, but not suitable for all roles and organizations.

## Related Decisions

- [ADR-0004: Use a Modular Monolith in .NET for the API Layer](./0004-api-architecture-modular-monolith-dotnet.md)

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Microsoft Docs: Secure User Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)