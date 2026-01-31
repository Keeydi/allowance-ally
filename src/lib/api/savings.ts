// Savings Goals API Service

export interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  targetDate: string | null;
}

export interface SavingsResponse {
  success: boolean;
  goals?: SavingsGoal[];
  goal?: SavingsGoal;
  message?: string;
}

import { API_BASE_URL } from '@/lib/api/config';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getSavingsGoals = async (): Promise<SavingsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/savings-goals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch savings goals' };
    }

    return { success: true, goals: data.goals || [] };
  } catch (error) {
    console.error('Get savings goals error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const createSavingsGoal = async (goal: {
  name: string;
  target: number;
  targetDate?: string;
}): Promise<SavingsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/savings-goals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goal),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to create savings goal' };
    }

    return { success: true, goal: data.goal };
  } catch (error) {
    console.error('Create savings goal error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const updateSavingsGoal = async (
  id: number,
  update: { amount?: number; name?: string; target?: number; targetDate?: string }
): Promise<SavingsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/savings-goals/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to update savings goal' };
    }

    return { success: true, goal: data.goal };
  } catch (error) {
    console.error('Update savings goal error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const deleteSavingsGoal = async (id: number): Promise<SavingsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/savings-goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to delete savings goal' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete savings goal error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

