// Budget API Service

export interface Budget {
  totalAllowance: number;
  periodType?: 'daily' | 'weekly' | 'monthly';
  needsAllocation: number;
  wantsAllocation: number;
  savingsAllocation: number;
  needsSpent: number;
  wantsSpent: number;
  savingsSpent: number;
}

export interface BudgetResponse {
  success: boolean;
  budget?: Budget;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getBudget = async (): Promise<BudgetResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/budget`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch budget' };
    }

    return { success: true, budget: data.budget };
  } catch (error) {
    console.error('Get budget error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const updateBudget = async (budget: {
  totalAllowance: number;
  periodType?: 'daily' | 'weekly' | 'monthly';
  needsAllocation: number;
  wantsAllocation: number;
  savingsAllocation: number;
}): Promise<BudgetResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/budget`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budget),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to update budget' };
    }

    return { success: true, budget: data.budget };
  } catch (error) {
    console.error('Update budget error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

