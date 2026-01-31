// Users API Service
// Functions for fetching user data

export interface UserData {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  joined: string;
  savings: string;
  role: number;
  last_login: string | null;
}

export interface UsersResponse {
  success: boolean;
  users?: UserData[];
  count?: number;
  message?: string;
}

// API Base URL
import { API_BASE_URL } from '@/lib/api/config';

/**
 * Get all users (admin only)
 * @returns UsersResponse with array of users
 */
export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch users'
      };
    }

    return {
      success: true,
      users: data.users,
      count: data.count
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

