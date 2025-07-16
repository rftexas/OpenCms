
## Data Model Relationships

### Core Entity Relationships

**Customer Organization Relationships:**
- Customer Organization → Categories (one-to-many, configurable)
- Customer Organization → Users (one-to-many)
- Customer Organization → Cases (one-to-many)
- Customer Organization → Custom Questions (one-to-many, through Categories)

**Category Relationships:**
- Category → Sub-categories (one-to-many)
- Category → Custom Questions (one-to-many)
- Category → Classification Rules (one-to-many for V2)
- Category → User Expertise (many-to-many through Category Expertise)

**User Relationships:**
- User → Category Expertise (many-to-many with proficiency levels)
- User → Cases (one-to-many as assigned investigator)
- User → Reviews (one-to-many as reviewer)
- User → Investigation Activities (one-to-many for Notes, Questions, Outcomes)
- User → Notifications (one-to-many)

**Case Relationships:**
- Case → Classification attributes (Category, Sub-category, Severity, Priority)
- Case → Investigation Activities (one-to-many for Notes, Questions, Outcomes)
- Case → Reviews (one-to-many)
- Case → Remedial Cases (one-to-many)
- Case → Custom Question Responses (one-to-many)

**Investigation Activity Relationships:**
- Investigation Activities → Case (many-to-one)
- Investigation Activities → User (many-to-one as creator)
- Review → Case (many-to-one)
- Review → User (many-to-one as reviewer)