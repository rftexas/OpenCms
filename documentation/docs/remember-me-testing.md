# Remember Me Functionality - Testing Guide

## Overview

The "Remember Me" functionality has been implemented to provide persistent login sessions. Here's how it works:

## Implementation Details

### Frontend (Login Component)
- Checkbox for "Remember me" option
- Passes `rememberMe` boolean to login action

### Authentication Logic
- **Remember Me CHECKED**: Token stored in `localStorage` (persistent across browser sessions)
- **Remember Me UNCHECKED**: Token stored in `sessionStorage` (cleared when browser session ends)

### Storage Strategy
- `localStorage`: Survives browser restarts, computer restarts (until manually cleared)
- `sessionStorage`: Cleared when browser tab/window is closed

## Testing the Functionality

### Manual Testing

1. **With Remember Me:**
   - Login with "Remember me" checked
   - Close browser completely
   - Reopen and navigate to the app
   - Should still be logged in

2. **Without Remember Me:**
   - Login with "Remember me" unchecked
   - Close browser tab/window
   - Reopen and navigate to the app
   - Should need to login again

### Automated Testing

The Playwright tests verify:
1. Token storage location (localStorage vs sessionStorage)
2. Persistence across context changes
3. Proper cleanup on logout

## Troubleshooting

### If Remember Me Doesn't Work:

1. **Check Browser Storage:**
   ```javascript
   // In browser console
   console.log('localStorage token:', localStorage.getItem('token'));
   console.log('sessionStorage token:', sessionStorage.getItem('token'));
   ```

2. **Check Token Validation:**
   - Ensure validateToken API endpoint works
   - Check App.tsx token initialization

3. **Check Logout Cleanup:**
   - Verify both storage locations are cleared on logout

### Common Issues:

1. **Token stored in wrong location:** Check loginUser thunk implementation
2. **Token not persisting:** Verify localStorage is being used for remember me
3. **Token validation fails:** Check API token validation endpoint

## Implementation Files Modified:

1. `web/src/store/slices/authSlice.ts` - Token storage logic
2. `web/src/authentication/login.tsx` - Remember me UI
3. `web/src/App.tsx` - Token initialization
4. `testing/tests/login.spec.ts` - Automated tests

## Security Considerations:

- `localStorage` tokens persist until explicitly cleared
- `sessionStorage` tokens are more secure but less convenient
- Users should be able to choose their security/convenience preference
- Logout always clears both storage locations

---

*Test the functionality manually first, then run automated tests to verify implementation.*
