# Architectural Decision Record: Use PostgreSQL as the Database

## Status

Accepted

## Context

The Case Management System (CMS) requires a reliable, open-source, and feature-rich relational database to store structured data such as cases, users, organizations, and configuration. The database must support:

- ACID transactions
- Strong consistency
- Flexible schema evolution
- Integration with popular tools (e.g., Liquibase, Keycloak)
- Containerized deployment for local development and production

## Decision

We will use **PostgreSQL** as the primary database for the CMS.

## Consequences

- Enables use of advanced SQL features, JSONB, and full-text search.
- Supported by major ORMs and migration tools (e.g., Liquibase).
- Easily runs in containers (Docker) for local and cloud environments.
- Well-supported by Keycloak for authentication and authorization.
- Requires operational knowledge of PostgreSQL for backup, scaling, and tuning.

## Alternatives Considered

- **MySQL/MariaDB**: Also open-source and widely used, but PostgreSQL offers richer features and better standards compliance.
- **SQL Server**: Commercial licensing and Windows-centric ecosystem.
- **NoSQL (MongoDB, etc.)**: Not chosen due to strong relational requirements and transactional needs.

## Related Decisions

- [ADR-0002: Use Liquibase for Database Migrations](./0002-use-liquibase-for-db-migrations.md)

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Official Postgres Image](https://hub.docker.com/_/postgres)