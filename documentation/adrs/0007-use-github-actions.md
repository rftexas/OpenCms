# Architectural Decision Record: Use GitHub Actions for DevOps

## Status

Accepted

## Context

The Case Management System (CMS) requires a DevOps solution for continuous integration (CI), continuous deployment (CD), and automation of development workflows. The team uses GitHub for source control, and several options are available for DevOps automation, including GitHub Actions, Azure DevOps, GitLab CI, and Jenkins.

## Decision

We will use **GitHub Actions** as the primary DevOps automation platform for CI/CD and related workflows.

## Consequences

- Seamless integration with GitHub repositories and pull requests.
- Enables automation of builds, tests, deployments, and code quality checks.
- Supports reusable workflows and marketplace actions for common tasks.
- Reduces context switching for developers by keeping CI/CD within GitHub.
- Limits on free minutes and concurrency may apply, but are sufficient for current needs.
- Vendor lock-in to GitHub for DevOps automation.

## Alternatives Considered

- **Azure DevOps**: Powerful and flexible, but adds complexity and requires integration with GitHub.
- **GitLab CI**: Not natively integrated with GitHub, would require migration or additional setup.
- **Jenkins**: Highly customizable, but requires self-hosting and maintenance.

## Related Decisions

- [ADR-0003: Frontend Framework – React with TypeScript](./0003-frontend-framework.md)
- [ADR-0004: Use a Modular Monolith in .NET for the API Layer](./0004-api-architecture-modular-monolith-dotnet.md)

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)