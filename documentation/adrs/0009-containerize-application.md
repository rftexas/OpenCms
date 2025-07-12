# Architectural Decision Record: Containerize the Application

## Status

Accepted

## Context

The Case Management System (CMS) needs to be easily deployable, scalable, and consistent across development, testing, and production environments. Containerization allows packaging the application and its dependencies into isolated, reproducible units. The team uses Docker Compose for local development and plans to use containers for deployment in the future.

## Decision

We will **containerize all application components** (API, frontend, database, supporting services) using Docker. Docker Compose will be used for local orchestration and development.

## Consequences

- Ensures consistent environments across all stages (dev, test, prod)
- Simplifies onboarding and local development
- Enables easier scaling and orchestration in the future (e.g., Kubernetes)
- Facilitates CI/CD automation and infrastructure as code
- Requires maintaining Dockerfiles and Compose files for all services

## Alternatives Considered

- **Traditional VM-based deployment**: More manual, less portable, and harder to scale.
- **Platform-specific packaging (e.g., MSI, EXE, ZIP)**: Not suitable for multi-service, cloud-native architectures.

## Related Decisions

- [ADR-0001: Use PostgreSQL as the Database](./0001-use-postgres-as-database.md)
- [ADR-0007: Use GitHub Actions for DevOps](./0007-use-github-actions.md)

## References

- [Docker Documentation](https://docs.docker.com/)
-