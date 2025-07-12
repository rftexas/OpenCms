# User Story: User Login

## Title
User Login to the Case Management System

## As a
Registered user (Administrator, Investigator, Reviewer, or Organization Admin)

## I want to
Log in to the Case Management System using my email and password

## So that
I can securely access my dashboard, manage cases, and perform my assigned tasks

---

### Acceptance Criteria

- The login page is accessible via a public URL.
- The user must enter a valid email address and password.
- If the credentials are correct and the account is active, the user is authenticated and redirected to their dashboard.
- If the credentials are incorrect, an error message is displayed ("Invalid email or password").
- If the account is inactive or locked, an appropriate error message is shown.
- The user can choose "Remember me" to stay logged in on the device.
- The user can click "Forgot password?" to initiate a password reset flow.
- The login form is accessible and works on desktop and mobile devices.
- All authentication actions are logged for audit purposes.

---

### Notes

- Passwords are never stored or transmitted in plain text.
- The system uses secure password hashing and salting.
- After 5 failed login attempts, the account is temporarily