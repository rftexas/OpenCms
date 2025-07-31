import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserTenant {
    tenantId: string;
    tenantName: string;
    roleName: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    primaryRole: string;
    tenants: UserTenant[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            // Try HTTPS first, fallback to HTTP for development
            let apiUrl = 'https://localhost:7011/api/authentication/login';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.log('Login error response:', error);
                return rejectWithValue(error.message || 'Login failed');
            }

            const data = await response.json();
            console.log('Login success response:', data);
            localStorage.setItem('token', data.token);

            // Transform API response to match our User interface
            return {
                user: {
                    id: data.userId,
                    email: data.email,
                    name: `${data.firstName} ${data.lastName || ''}`.trim(),
                    primaryRole: data.primaryRole || 'User',
                    tenants: data.tenants || []
                },
                token: data.token
            };
        } catch (error) {
            console.log('Login network error:', error);
            // Check if it's a network connectivity issue
            if (error instanceof TypeError && error.message.includes('fetch')) {
                return rejectWithValue('Unable to connect to server. Please check if the API is running.');
            }
            return rejectWithValue('Network error occurred while logging in.');
        }
    }
);

export const validateToken = createAsyncThunk(
    'auth/validate',
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await fetch('https://localhost:5001/api/auth/validate', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                return rejectWithValue('Invalid token');
            }

            const userData = await response.json();
            return userData;
        } catch (error) {
            localStorage.removeItem('token');
            return rejectWithValue('Token validation failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await fetch('https://localhost:5001/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (error) {
            // Continue with logout even if API call fails
        } finally {
            localStorage.removeItem('token');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Validate token cases
            .addCase(validateToken.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(validateToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(validateToken.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            // Logout cases
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;

// Helper functions for role checking
export const isSuperUser = (user: User | null): boolean => {
    return user?.primaryRole === 'Super User';
};

export const isAdministrator = (user: User | null): boolean => {
    return user?.primaryRole === 'Administrator' || isSuperUser(user);
};

export const hasRole = (user: User | null, roleName: string): boolean => {
    if (!user) return false;
    return user.primaryRole === roleName || user.tenants.some(t => t.roleName === roleName);
};

export const getTenantsByRole = (user: User | null, roleName: string): UserTenant[] => {
    if (!user) return [];
    return user.tenants.filter(t => t.roleName === roleName);
};

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;