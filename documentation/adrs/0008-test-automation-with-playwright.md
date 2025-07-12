# Architectural Decision Record: Use Playwright for Test Automation

## Status

Accepted

## Context

The Case Management System (CMS) requires end-to-end (E2E) and integration test automation to ensure quality and reliability of the user interface and API. The team needs a modern, cross-browser, and developer-friendly tool that integrates well with CI/CD pipelines and supports testing of React (TypeScript) applications.

## Decision

We will use **Playwright** as the primary tool for automated end-to-end and integration testing.

## Consequences

- Enables fast, reliable, and cross-browser E2E testing (Chromium, Firefox, WebKit).
- Supports testing of modern web apps built with React and TypeScript.
- Provides powerful features such as parallel test execution, network mocking, and visual comparisons.
- Integrates easily with GitHub Actions and other CI/CD platforms.
- Requires the team to learn Playwright's API and best practices.

## Alternatives Considered

- **Selenium**: Mature and widely used, but slower and less developer-friendly for modern web apps.
- **Cypress**: Excellent developer experience, but limited to Chromium-based browsers and less flexible for multi-browser testing.
- **TestCafe**: Good cross-browser support, but smaller ecosystem and less momentum than Playwright.

## Related Decisions

- [ADR-0003: Frontend Framework – React with TypeScript](./0003-frontend-framework.md)
- [ADR-0007: Use GitHub Actions for DevOps](./0007-use-github-actions.md)

## References

- [Playwright Documentation](https://playwright.dev/)