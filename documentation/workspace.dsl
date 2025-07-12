workspace {
    !decisions ./adrs
    !docs ./docs
    model {
        archetypes {
            datastore = container {
                tag "db"
            }
        }

        superUser = person "Super User" {
            description "Has system-wide privileges, including adding new Customer Organizations."
        }

        admin = person "Administrator" {
            description "Configures categories, users, and organization settings for their Customer Organization."
        }

        investigator = person "Investigator" {
            description "Investigates assigned cases and documents findings."
        }

        reviewer = person "Reviewer" {
            description "Reviews investigations for quality and compliance."
        }

        anonymousReporter = person "Anonymous Reporter" {
            description "Submits cases without authentication."
        }

        organization = softwareSystem "Customer Organization" {
            description "Represents a tenant using the CMS."
        }

        paymentProvider = softwareSystem "Payment Provider" {
            description "Third-party service for handling payments and subscriptions (e.g., Stripe, PayPal)."
        }


        cms = softwareSystem "Case Management System" {
            description "Enables anonymous reporting, structured investigation, and administration of cases."
            
            webApp = container "Web Application" "React + TypeScript SPA" "Provides the user interface for all roles." {
                caseSubmissionForm = component "Case Submission Form" "Allows anonymous users to submit cases."
                caseManagementDashboard = component "Case Management Dashboard" "Displays cases for investigators and reviewers."
                adminPanel = component "Admin Panel" "Configuration interface for administrators."
                userManagement = component "User Management" "Allows administrators to manage users and roles."
                organizationSettings = component "Organization Settings" "Allows administrators to configure organization-specific settings."
                notificationCenter = component "Notification Center" "Displays notifications for case updates and actions."
                caseDetails = component "Case Details" "Displays detailed information about a specific case."
                authentication = component "Authentication" "Handles user login, registration, and session management."
                paymentManagement = component "Payment Management" "Handles subscription and billing management."
            }
            
            api = container "API Layer" "ASP.NET Core Modular Monolith" "Exposes business logic and data access as REST APIs." {
                caseController = component "Case Controller" "Manages case operations."
                userController = component "User Controller" "Manages user operations."
                organizationController = component "Organization Controller" "Manages organization settings."
                notificationController = component "Notification Controller" "Handles notifications for case updates."
                authenticationController = component "Authentication Controller" "Handles user authentication and authorization."
                paymentController = component "Payment Controller" "Handles payment processing and subscription management."

                caseCreatedEvent = component "CaseCreatedEvent" "Event: A new case has been created."
                caseService = component "Case Service" "Publishes and subscribes to case-related events." {
                    description "Handles case creation and updates, publishing events to the message bus."
                }

                authenticationService = component "Authentication Service" "Manages user authentication and authorization." {
                    description "Handles user login, registration, and session management."
                }

                notificationService = component "Notification Service" "Subscribes to events and sends notifications." {
                    description "Listens for case-related events and sends notifications to users."
                }

                auditService = component "Audit Service" "Records actions and changes for compliance." {
                    description "Logs actions taken on cases for auditing purposes."
                }
            }

            db = datastore "Database" "PostgreSQL" "Stores all structured data for cases, users, organizations, etc."

            
            messageBus = container "Message Bus" {
                description "Facilitates asynchronous communication between components."
            }

        }

        // Relationships
        superUser -> cms "Adds and manages Customer Organizations"
        admin -> cms "Configures categories, users, org settings"
        investigator -> cms "Documents findings, updates cases"
        reviewer -> cms "Reviews cases"
        anonymousReporter -> cms "Submits cases via public interface"

        caseService -> caseCreatedEvent "Publishes"
        notificationService -> caseCreatedEvent "Subscribes"
        caseService -> messageBus "Published to"
        notificationService -> db "Stores notifications"
        caseService -> db "Reads and writes case data"
        auditService -> db "Records audit logs"
        authenticationService -> db "Manages user credentials"

        caseController -> caseService "Uses"
    }

    views {
        systemContext cms {
            include *
            autolayout lr
            title "Case Management System - System Context"
            description "Shows the CMS, its users, and external systems."
        }

        container cms {
            include *
            autolayout lr
            title "Case Management System - Container View"
            description "Shows the main containers and their relationships."
        }

        component webApp {
            include *
            autolayout tb
            title "Case Management System - Web Application Components"
            description "Details the components within the web application."
        }

        component api {
            include *
            autolayout tb
            title "Case Management System - API Layer Components"
            description "Details the components within the API layer."
        }
        styles {
            element "db" {
                shape cylinder
                background #f5da81
                color #000000
            }
        }
    }
}