// Dashboard API Service

export interface RecentExpense {
  id: number;
  category: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  name: string;
  target: number;
  current: number;
}

export interface DashboardData {
  balance: number;
  allowance: number;
  spent: number;
  budgetUsed: number;
  recentExpenses: RecentExpense[];
  savingsGoal: SavingsGoal | null;
}

export interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch dashboard data' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get dashboard error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};


