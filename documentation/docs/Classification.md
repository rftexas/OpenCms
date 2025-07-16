
## Case Classification System

### V1 Implementation - Standard Classification Rules

**Category-to-Severity Mapping (Default Rules):**
- HR → Harassment: High Severity (default)
- HR → Discrimination: High Severity (default)
- HR → Policy Violation: Medium Severity (default)
- HR → Workplace Conduct: Medium Severity (default)
- HR → Benefits Issues: Low Severity (default)
- HR → Performance Issues: Low Severity (default)
- HR → Retaliation: High Severity (default)
- Compliance → Regulatory Violation: High Severity (default)
- Compliance → Data Privacy: High Severity (default)
- Compliance → Financial Misconduct: Critical Severity (default)
- Compliance → Safety Violation: High Severity (default)
- Compliance → Legal Compliance: High Severity (default)
- Compliance → Audit Findings: Medium Severity (default)
- Ethics → Conflict of Interest: Medium Severity (default)
- Ethics → Fraud: High Severity (default)
- Ethics → Corruption: Critical Severity (default)
- Ethics → Whistleblower Report: High Severity (default)
- Ethics → Code of Conduct Violation: Medium Severity (default)
- Safety & Security → Workplace Safety: High Severity (default)
- Safety & Security → Security Incident: High Severity (default)
- Safety & Security → Emergency Response: Critical Severity (default)
- Safety & Security → Health Hazard: High Severity (default)
- Safety & Security → Violence/Threats: Critical Severity (mandatory)
- General → General Inquiry: Low Severity (default)
- General → Suggestion: Low Severity (default)
- General → Process Improvement: Low Severity (default)
- General → Other: Low Severity (default)

**Priority Inference Factors:**
- Base priority from Category/Sub-category mapping
- Severity level modifier (Critical Severity = High Priority minimum)
- Organizational risk factors
- Timeline sensitivity (e.g., regulatory deadlines)

**Standard Priority Assignments:**
- Critical Severity cases: High Priority (minimum)
- High Severity cases: Medium Priority (default)
- Medium Severity cases: Medium Priority (default)
- Low Severity cases: Low Priority (default)

### V2 Enhancement - Configurable Classification Rules

**Future Feature**: Administrators will be able to configure custom classification rules including:
- Custom Category-to-Severity mappings
- Custom Priority inference rules
- Organization-specific classification logic
- Dynamic rule adjustment based on case patterns