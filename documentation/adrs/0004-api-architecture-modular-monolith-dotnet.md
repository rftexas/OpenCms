# Architectural Decision Record: Use a Modular Monolith in Dotnet for the API Layer

## Status

Accepted

## Context

The Case Management System (CMS) requires a robust, maintainable, and scalable backend architecture for its API layer. The main architectural options considered were a modular monolith, microservices, and a traditional layered monolith. The API must support:

- Clear separation of business domains (e.g., Cases, Users, Organizations, Categories)
- Maintainability and testability
- Efficient development and deployment for a small-to-medium team
- Integration with PostgreSQL, Keycloak, and other services
- Flexibility for future evolution (e.g., migration to microservices if needed)

## Decision

We will implement the API layer as a **modular monolith** using **.NET**.

## Consequences

- Each business domain is encapsulated in its own module, enforcing boundaries and reducing coupling.
- Simplifies deployment and operational complexity compared to microservices.
- Enables efficient local development and debugging.
- Facilitates code sharing and reuse across modules.
- Provides a clear path to future decomposition into microservices if scaling needs arise.
- Requires discipline to maintain module boundaries within a single codebase.

## Alternatives Considered

- **Microservices**: Offers independent deployment and scaling, but adds significant operational and architectural complexity not justified at the current scale.
- **Traditional Monolith**: Simple, but risks tight coupling and lack of clear domain boundaries, making future scaling and maintenance harder.

## Related Decisions

- [ADR-0001: Use PostgreSQL as the Database](./0001-use-postgres-as-database.md)
- [ADR-0003: Frontend Framework – React with TypeScript](./0003-frontend-framework.md)

## References

- [Microsoft Docs: Modular Monoliths](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#modular-monolithic-architecture)
-