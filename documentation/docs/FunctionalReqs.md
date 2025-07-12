## Functional Requirements

### Super User and Customer Organization Management
- Super User can create, update, and deactivate Customer Organizations (tenants)
- Super User can assign the initial Administrator for each Customer Organization
- Super User has access to system-wide audit logs and organization management features

### Administrative Configuration
- **Category Management**: Administrators can create, modify, and deactivate Categories and Sub-categories
- **Classification Rules**: Configure automatic Severity and Priority inference based on Category/Sub-category
- **Custom Questions**: Define additional intake questions per Category with various field types
- **Expertise Assignment**: Assign and manage Category expertise for Investigators and Reviewers
- **Review Configuration**: Set review rates and mandatory review requirements per Category
- **Organizational Settings**: Configure notification preferences, workflows, and policies

### Standard HR/Compliance Categories
**Human Resources (HR)**
- Sub-categories: Harassment, Discrimination, Policy Violation, Workplace Conduct, Benefits Issues, Performance Issues, Retaliation
- Typical Severity: Medium to Critical (based on sub-category)
- Typical Priority: Medium to High

**Compliance**
- Sub-categories: Regulatory Violation, Data Privacy, Financial Misconduct, Safety Violation, Legal Compliance, Audit Findings
- Typical Severity: High to Critical
- Typical Priority: High

**Ethics**
- Sub-categories: Conflict of Interest, Fraud, Corruption, Whistleblower Report, Code of Conduct Violation
- Typical Severity: Medium to Critical
- Typical Priority: Medium to High

**Safety & Security**
- Sub-categories: Workplace Safety, Security Incident, Emergency Response, Health Hazard, Violence/Threats
- Typical Severity: High to Critical
- Typical Priority: High

**General**
- Sub-categories: General Inquiry, Suggestion, Process Improvement, Other
- Typical Severity: Low to Medium
- Typical Priority: Low to Medium

### User Management and Role Assignment
- Users are associated with a specific Customer Organization
- Each User can have one or more roles within their organization:
  - Investigator: Can investigate assigned cases
  - Reviewer: Can investigate cases AND review other Investigators' work
  - Administrator: Can configure organizational settings and manage users
- Role assignment is configurable at the Organization level
- Users can only access cases within their Customer Organization

### Category Expertise Management
- Administrators can assign Category expertise to Users with Investigator or Reviewer roles
- Expertise assignments enable intelligent case routing based on investigator specialization
- Simple Category-to-Priority mapping for V1 (e.g., HR Category → Medium Priority default)
- Expertise can be added, removed, or modified by Administrators
- System uses expertise for automatic case assignment when available

### Role Transition Management
- Users can transition between roles (Investigator ↔ Reviewer)
- **Investigator to Reviewer transition**:
  - Must complete all assigned cases OR manually reassign them to other Users
  - Cannot review cases they previously investigated
- **Reviewer to Investigator transition**:
  - All pending review assignments must be reassigned to other Reviewers
  - Loses review privileges but retains investigation capabilities
- All role changes maintain complete audit trail

### Case Creation
- Anonymous reporters can submit cases through a public interface
- Case submission requires selection of target Customer Organization
- System generates unique case identifier
- Initial case details are captured (description, category, sub-category, etc.)
- Reporter selects Category and Sub-category from organization-specific options
- **Dynamic Questions**: Additional Category-specific questions appear based on selected Category
- Category-specific questions are configured by Administrators per organization
- System automatically infers Severity and Priority based on Category/Sub-category
- Case is automatically assigned "New" status
- Classification affects initial routing and handling procedures

### Case Assignment and Investigation
- Cases are assigned to Users with Investigator role based on Category expertise
- **Expertise-Based Assignment**: System prioritizes investigators with matching Category expertise
- Fallback to general assignment if no expertise match is available
- Higher Priority cases receive expedited assignment and investigation timelines
- Critical Severity cases may trigger immediate escalation or specialized handling
- Assignment can be manual or automatic based on organization policies and case classification
- Users can only investigate cases assigned to them
- All investigation activities are tracked and auditable
- Investigators can modify Severity/Priority during investigation based on findings

### Quality Review Process
- **Automatic Review**: Random sampling of closed cases based on organization-configurable review rate
- **Priority-Based Review**: Higher Priority/Severity cases have increased review probability
- **Category-Specific Review**: Certain categories (e.g., Ethics, Critical Safety) may require mandatory review
- **Escalated Review**: Investigators can escalate active cases to Reviewers for guidance or oversight
- Review sampling excludes cases investigated by the same Reviewer
- Review process evaluates investigation quality, thoroughness, and compliance with category-specific procedures
- Review results are documented and may trigger feedback, retraining, or remedial actions

### Outcome Follow-up and Accountability
- Reviewers can follow up on investigation Outcomes to verify completion
- Follow-up includes evidence collection and validation of corrective measures
- Incomplete or inadequate follow-up can trigger additional investigation actions
- System tracks follow-up activities and completion status

### Remedial Case Creation
- Poor investigation quality identified during review can trigger creation of new remedial cases
- Remedial cases address deficiencies in original investigation
- Follow standard case lifecycle but focus on correcting previous investigation issues
- Original case remains in system with linkage to remedial case for audit purposes

### Access Control
- Anonymous reporters have no ongoing access after case submission
- Users can only access cases for their Customer Organization
- Investigators can investigate cases assigned to them
- Reviewers have all Investigator permissions plus review capabilities
- Reviewers can access cases for review that they did not investigate
- **Administrators have full organizational access**: manage users, configure categories, view all cases
- System maintains separation between different Customer Organizations

### Reporting and Tracking
- Customer Organizations can view case statistics and metrics by Category, Sub-category, Severity, and Priority
- Case progress can be tracked through status changes with classification context
- Investigation activities are searchable and filterable by classification attributes
- Notification delivery reports and engagement metrics
- Trend analysis by case classification and resolution patterns
- Compliance reporting with category-specific metrics

### Notification System
- **In-App Notifications**: Primary notification mechanism within the CMS interface
- **External Integrations**: Configurable Email, Slack, and Microsoft Teams notifications
- **User Preferences**: Each user can configure notification channels and frequency
- **Notification Types**: Case assignments, escalations, reviews, status changes, follow-ups, and reminders
- **Delivery Modes**: Immediate alerts or digest summaries based on user preference
- **Audit Trail**: Complete history of notification delivery and read status

### Notification Triggers
- Case assigned to user (with Priority/Severity indicators)
- Case escalated by investigator
- Case selected for quality review
- Case status changes (resolved, closed, reopened)
- High/Critical Priority cases approaching deadlines
- Follow-up actions required
- Role transition completed
- Review feedback available
- Remedial case created
- Category-specific alerts (e.g., Critical Safety incidents)

### Payment and Subscription Management

- Organizations can subscribe to the CMS using a credit card via a secure payment portal.
- The system supports multiple subscription tiers (e.g., Free Trial, Standard, Enterprise).
- Payment portal integrates with a third-party provider (e.g., Stripe, PayPal) for processing credit card payments.
- Super User and/or Organization Admins can view and manage their subscription and billing information.
- Access to features and user seats is controlled based on the active subscription.
- Automated billing, invoicing, and renewal notifications are supported.
- Failed payments trigger notifications and may restrict access after a grace period.

## Non-Functional Requirements

### Security
- Anonymous reporter identity protection
- Data encryption in transit and at rest
- Role-based access control
- Audit logging for all system actions
- PCI DSS compliance for handling credit card data (delegated to third-party payment provider)
- Secure integration with payment provider APIs

### Performance
- System supports multiple concurrent users
- Case search and retrieval within acceptable response times
- Scalable to handle growing case volumes

### Usability
- Intuitive interface for anonymous case submission
- Professional dashboard for investigators and reviewers
- Mobile-responsive design for field access

### Compliance
- Data retention policies configurable per Customer Organization
- Export capabilities for regulatory reporting
- Privacy controls for sensitive case information
- Support for invoicing and receipts for tax/regulatory purposes
- Data retention and privacy for billing information

### Integration
- Email notification delivery
- Slack workspace integration for notifications
- Microsoft Teams channel notifications
- Webhook support for custom integrations
- API endpoints for notification management