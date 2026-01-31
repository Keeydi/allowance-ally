// Authentication API Service - Supabase Auth + backend user sync
import { API_BASE_URL } from '@/lib/api/config';
import { supabase } from '@/lib/supabase';

export interface User {
  id: number;
  email: string;
  role: 0 | 1; // 0 = user, 1 = admin
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  message?: string;
}

/** True if the error is a network/connection failure (e.g. backend not running) */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
  if (error instanceof Error && /fetch|network|connection refused/i.test(error.message)) return true;
  return false;
}

/**
 * Fetch app user from backend (syncs Supabase user to MySQL and returns our User type)
 */
async function fetchAppUser(accessToken: string): Promise<User | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to get user');
  }

  const data = await response.json();
  return data.user ?? null;
}

/**
 * Persist token and user for API modules that use getAuthToken() / getCurrentUser()
 */
function persistSession(accessToken: string, user: User) {
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Login with Supabase Auth, then sync to backend and get app user
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        message: authError.message === 'Invalid login credentials'
          ? 'Invalid email or password.'
          : authError.message,
      };
    }

    const session = authData.session;
    if (!session?.access_token) {
      return { success: false, message: 'No session after login' };
    }

    try {
      const user = await fetchAppUser(session.access_token);
      if (!user) {
        return { success: false, message: 'Failed to load user profile' };
      }
      persistSession(session.access_token, user);
      return { success: true, user, token: session.access_token };
    } catch (err) {
      if (isNetworkError(err)) {
        return {
          success: false,
          message: 'Backend server is not reachable. Start it with: cd backend && npm start',
        };
      }
      throw err;
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please try again later.',
    };
  }
};

/**
 * Register with Supabase Auth (with optional first/last name in user_metadata), then sign in and sync to backend
 */
export const register = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<RegisterResponse> => {
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName ?? '',
          last_name: lastName ?? '',
        },
      },
    });

    if (signUpError) {
      return {
        success: false,
        message: signUpError.message === 'User already registered'
          ? 'Email already registered. Try signing in.'
          : signUpError.message,
      };
    }

    // If email confirmation is required, user might not have session yet
    const session = signUpData.session;
    if (!session?.access_token) {
      return {
        success: true,
        message: 'Account created. Please check your email to confirm, then sign in.',
      };
    }

    try {
      const user = await fetchAppUser(session.access_token);
      if (!user) {
        return { success: false, message: 'Account created but failed to load profile. Try signing in.' };
      }
      persistSession(session.access_token, user);
      return { success: true, user };
    } catch (err) {
      if (isNetworkError(err)) {
        const isLocal = /localhost|127\.0\.0\.1/.test(API_BASE_URL);
        return {
          success: true,
          message: isLocal
            ? 'Account created! Start the backend (cd backend && npm start), then sign in.'
            : 'Account created! The server could not be reached. Try signing in in a moment.',
        };
      }
      throw err;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please try again later.',
    };
  }
};

/**
 * Logout from Supabase and clear local session
 */
export const logout = (): void => {
  supabase.auth.signOut().catch(() => {});
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage (set after login/register/me)
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * Get auth token (Supabase access_token) for API calls
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Check if user is authenticated (has token and user in storage)
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};

/**
 * Refresh session from Supabase and sync user from backend (e.g. on app load)
 */
export const refreshSession = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  try {
    const user = await fetchAppUser(session.access_token);
    if (user) {
      persistSession(session.access_token, user);
      return user;
    }
  } catch {
    // Session may be expired or backend error
  }
  return null;
};

/**
 * Verify token with backend (optional)
 */
export const verifyToken = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
};
