import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, isAuthenticated } from '@/lib/api/auth';

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

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const currentUser = getCurrentUser();
      if (currentUser && isAuthenticated()) {
        setUser(currentUser);
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
      
      if (response.success && response.user) {
        setUser(response.user);
        
        // New users are always regular users (role 0)
        // Redirect to user dashboard
        navigate('/dashboard');
        
        return { success: true };
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

