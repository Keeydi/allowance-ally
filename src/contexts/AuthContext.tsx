import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, getAuthToken, refreshSession } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user: try Supabase session first (sync to backend), then fallback to localStorage
  useEffect(() => {
    const loadUser = async () => {
      const synced = await refreshSession();
      if (synced) {
        setUser(synced);
      } else {
        const currentUser = getCurrentUser();
        if (currentUser && getAuthToken()) {
          setUser(currentUser);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // Redirect based on role
        if (response.user.role === 1) {
          // Admin - redirect to admin dashboard
          navigate('/admin');
        } else {
          // Regular user - redirect to user dashboard
          navigate('/dashboard');
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    try {
      const response = await apiRegister(email, password, firstName, lastName);
      
      if (response.success) {
        if (response.user) {
          setUser(response.user);
          navigate('/dashboard');
        }
        // If no user (e.g. email confirmation required), success message is in response.message
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during registration' };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    navigate('/login');
  };

  const isAdmin = () => {
    return user?.role === 1;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

