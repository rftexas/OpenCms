# Architectural Decision Record: Message Bus – Rebus vs MassTransit

## Status

Proposed

## Context

The Case Management System (CMS) may require asynchronous messaging for features such as background processing, integration events, or communication between modules. Two popular .NET libraries for implementing a message bus are **Rebus** and **MassTransit**. Both support multiple transport options (e.g., RabbitMQ, Azure Service Bus), are open source, and are widely used in the .NET ecosystem.

## Decision Drivers

- Ease of integration with .NET modular monolith architecture
- Learning curve and documentation
- Community support and maintenance
- Features (sagas, retries, scheduling, etc.)
- Flexibility and extensibility
- Performance and reliability

## Options

### 1. Rebus

**Pros:**
- Lightweight and easy to set up
- Minimal configuration and dependencies
- Good documentation and simple API
- Suitable for modular monoliths and microservices
- Actively maintained

**Cons:**
- Fewer advanced features compared to MassTransit (e.g., sagas, advanced routing)
- Smaller community and ecosystem

### 2. MassTransit

**Pros:**
- Rich feature set (sagas, state machines, scheduling, advanced routing, etc.)
- Strong integration with popular transports (RabbitMQ, Azure Service Bus, etc.)
- Large community and extensive documentation
- Used in many enterprise projects

**Cons:**
- More complex setup and configuration
- Heavier dependency footprint
- Steeper learning curve for advanced features

## Recommendation

**Choose Rebus** if:
- You want a lightweight, easy-to-use library for simple messaging needs
- Your team prefers minimal configuration and a gentle learning curve
- Advanced features (sagas, state machines) are not required

**Choose MassTransit** if:
- You need advanced messaging features (sagas, scheduling, etc.)
- You expect to scale to more complex workflows or distributed systems
- Your team is comfortable with a more feature-rich, opinionated framework

## Consequences

- The choice will affect development speed, maintainability, and the ability to implement advanced messaging patterns.
- Rebus is ideal for simple, modular architectures and rapid adoption.
- MassTransit is better suited for complex, enterprise-scale scenarios.

## References

- [Rebus Documentation](https://github.com/rebus-org/Rebus/wiki)
- [MassTransit Documentation](https://masstransit.io/documentation/)