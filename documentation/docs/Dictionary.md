## Ubiquitous Language

### Core Entities

**Super User**
- A system-level user with privileges to add and manage Customer Organizations (tenants)
- Can view and manage all organizations, but does not participate in case investigations or reviews
- Responsible for onboarding new customers and delegating administrative access

**Case**
- A formal record of an incident, complaint, or matter requiring investigation
- Contains initial report details, metadata, and tracking information
- Has a unique identifier and lifecycle status
- Assigned to a specific Customer Organization
- Classified by Category, Sub-category, Severity, and Priority for proper handling and routing

**Category**
- High-level classification of case type (e.g., HR, Compliance, Ethics, Safety)
- Defines the general domain of the case and determines appropriate handling procedures
- Used for routing cases to appropriate investigators and establishing baseline severity/priority
- Configurable per Customer Organization to match their specific needs

**Sub-category**
- Specific classification within a Category (e.g., HR → Harassment, Discrimination, Policy Violation)
- Provides detailed context for case handling and investigation approaches
- Used to infer appropriate Severity and Priority levels
- Enables specialized investigation procedures and reviewer assignment

**Severity**
- Assessment of the potential impact or seriousness of the case
- Levels: Not Defined, Low, Medium, High, Critical
- Influences investigation timeline and resource allocation
- Can be inferred from Category/Sub-category combination or manually set
- Affects escalation thresholds and review requirements

**Priority**
- Urgency level for case handling and resolution
- Levels: Not Defined, Low, Medium, High
- Determines investigation scheduling and response timeframes
- Can be inferred from Category/Sub-category combination or manually adjusted
- Influences notification frequency and escalation triggers

**Category Expertise**
- Assignment of User competency in specific Categories for case handling
- Configured by Administrators to match investigator skills and experience
- Used for intelligent case assignment and routing
- Can be weighted or prioritized for assignment algorithms
- Enables specialized handling of complex or sensitive case types

**Category-Specific Questions**
- Additional intake fields configured per Category by Administrators
- Dynamically displayed during case submission based on selected Category
- Captures specialized information relevant to specific case types
- Supports various question types (text, dropdown, checkbox, etc.)
- Improves case context and investigation efficiency

**Anonymous Reporter**
- An individual who submits a case without revealing their identity
- Provides initial case details and context
- May or may not have ongoing involvement in the case

**Customer Organization**
- The entity (company, department, institution) that owns and manages cases
- Has associated Investigators and Reviewers
- Defines case handling procedures and policies

**User**
- An individual associated with a Customer Organization
- Has defined roles and permissions within their organization
- Authenticated system participant with specific access rights
- Can have Category expertise assignments for specialized case handling

**Administrator**
- A User role with organizational management capabilities
- Can configure Categories, Sub-categories, and case intake questions
- Manages User role assignments and Category expertise mappings
- Configures organizational settings, review rates, and classification rules
- Has system-wide access within their Customer Organization

**Investigator Role**
- A role that authorizes a User to actively investigate cases
- Can create Notes, ask Questions, and log Outcomes
- Primary actor responsible for case progression
- All Users with Investigator role can investigate cases assigned to them

**Reviewer Role**
- A role that includes all Investigator capabilities plus supervisory functions
- Can investigate cases (has all Investigator permissions)
- Receives random sampling of cases for quality review
- Reviews other Investigators' work, never their own investigations
- Has oversight responsibilities for investigation quality and consistency

### Investigation Activities

**Note**
- A record of observations, findings, or thoughts made by an Investigator
- Timestamped and attributed to the creator
- Can include text, attachments, or references

**Question**
- A formal inquiry raised during investigation
- May be directed to specific parties or general investigation points
- Tracks responses and resolution status

**Outcome**
- A recorded result or decision point in the investigation
- Documents findings, actions taken, or case resolution
- May trigger case status changes

**Review**
- A quality assurance process where a Reviewer evaluates another Investigator's work
- Triggered automatically when cases are closed (based on organization's review rate)
- Can be initiated through Investigator escalation during active investigation
- Includes assessment of investigation thoroughness, documentation quality, and adherence to procedures
- Results in feedback, recommendations, quality scores, or follow-up actions
- Part of the organization's quality control mechanism

**Escalation**
- Process by which an Investigator requests Reviewer involvement during active investigation
- Can be initiated for complex cases, policy questions, or when additional expertise is needed
- Transfers case oversight to a Reviewer while maintaining investigation continuity

**Follow-up**
- Process where Reviewers verify completion of recommended actions from Outcomes
- Includes evidence collection and validation of corrective measures
- Ensures accountability for investigation results and organizational improvements

**Case Reassignment**
- Process of transferring case ownership from one User to another
- Triggered by role changes, workload balancing, or investigation quality concerns
- Maintains complete audit trail of ownership changes

**Remedial Case**
- A new case created to address investigation quality issues identified during review
- Generated when initial investigation is deemed inadequate or non-compliant
- Follows standard case lifecycle but focuses on correcting previous investigation deficiencies

**Notification**
- An alert or message sent to a User about system events or case updates
- Delivered through multiple channels based on user preferences
- Includes case assignments, escalations, reviews, status changes, and follow-up reminders
- Maintains delivery history and read status for audit purposes

**Notification Channel**
- A delivery method for notifications (In-App, Email, Slack, Teams)
- Configurable per user based on preferences and organizational policies
- Each channel can be enabled/disabled for different notification types
- Supports both immediate and digest delivery modes

### Process States

**Case Status**
- New: Recently submitted, awaiting assignment
- Assigned: Case has been assigned to an Investigator
- In Progress: Actively being investigated
- Escalated: Investigation escalated to Reviewer oversight
- Pending: Waiting for additional information or action
- Resolved: Investigation complete with outcome
- Under Review: Case being evaluated for quality assurance
- Closed: Case finalized and archived
- Reopened: Previously closed case reactivated due to new information or quality issues

**Case Status Transitions**
- New → Assigned (automatic/manual based on expertise matching)
- Assigned → In Progress (when investigator begins work)
- In Progress → Escalated (investigator-initiated)
- In Progress → Pending (waiting for information)
- Pending → In Progress (information received)
- Any active state → Resolved (investigation complete)
- Resolved → Under Review (quality review triggered)
- Under Review → Closed (review passed)
- Under Review → Reopened (review failed, remedial action needed)

**Payment Portal**
- A system component that enables organizations or users to subscribe, pay for, and manage billing for the Case Management System.
- Integrates with third-party payment providers (e.g., Stripe, PayPal).
- Supports credit card payments and subscription management.

**Subscription**
- Represents a paid plan or tier for a Customer Organization.
- Determines feature access, user limits, and billing cycles.