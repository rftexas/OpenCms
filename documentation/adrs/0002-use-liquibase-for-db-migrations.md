# Architectural Decision Record: Use Liquibase for Database Migrations

## Status

Accepted

## Context

The Case Management System (CMS) requires a reliable and automated way to manage database schema changes across development, testing, and production environments. Schema migrations must be:

- Version-controlled and auditable
- Repeatable and idempotent
- Compatible with PostgreSQL and containerized workflows
- Usable by developers and CI/CD pipelines

## Decision

We will use **Liquibase** as the tool for managing database migrations.

## Consequences

- Enables tracking and versioning of all schema changes in source control.
- Supports rollback and forward migration operations.
- Integrates with Docker and CI/CD for automated deployments.
- Provides a standard format (XML, YAML, JSON, SQL) for migration scripts.
- Requires developers to learn Liquibase conventions and syntax.

## Alternatives Considered

- **Flyway**: Simpler, but less flexible for complex migrations and rollback scenarios.
- **Manual SQL scripts**: Error-prone, lacks versioning and automation.
- **Entity Framework/ORM migrations**: Tightly coupled to application code, less suitable for multi-language environments.

## Related Decisions

- [ADR-0001: Use PostgreSQL as the Database](./0001-use-postgres-as-database.md)

## References

- [Liquibase Documentation](https://www.liquibase.org/documentation/index.html)