// Expenses API Service

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface ExpensesResponse {
  success: boolean;
  expenses?: Expense[];
  expense?: Expense;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getExpenses = async (): Promise<ExpensesResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch expenses' };
    }

    return { success: true, expenses: data.expenses || [] };
  } catch (error) {
    console.error('Get expenses error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const createExpense = async (expense: {
  category: string;
  amount: number;
  date: string;
  note?: string;
}): Promise<ExpensesResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to create expense' };
    }

    return { success: true, expense: data.expense };
  } catch (error) {
    console.error('Create expense error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

export const deleteExpense = async (id: number): Promise<ExpensesResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to delete expense' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete expense error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};

