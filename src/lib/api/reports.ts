// Reports API Service

export interface ExpenseCategory {
  name: string;
  value: number;
  fill: string;
}

export interface WeeklyTrend {
  day: string;
  spent: number;
  budget: number;
}

export interface BudgetVsActual {
  category: string;
  budget: number;
  actual: number;
}

export interface MonthlyOverview {
  month: string;
  income: number;
  expenses: number;
}

export interface ReportsData {
  expensesByCategory: ExpenseCategory[];
  weeklyTrend: WeeklyTrend[];
  budgetVsActual: BudgetVsActual[];
  monthlyOverview: MonthlyOverview[];
  summary: {
    totalExpenses: number;
    avgDaily: number;
    topCategory: string;
  };
  insights: string[];
  recommendations: string[];
}

export interface ReportsResponse {
  success: boolean;
  data?: ReportsData;
  message?: string;
}

import { API_BASE_URL } from '@/lib/api/config';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getReports = async (period: 'week' | 'month' = 'week'): Promise<ReportsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/reports?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch reports' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get reports error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};


