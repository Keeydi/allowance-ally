// Discipline API Service

export interface Alert {
  id: string;
  type: "warning" | "danger" | "success";
  title: string;
  message: string;
  category?: string;
  percentage?: number;
}

export interface DisciplineRule {
  rule: string;
  isFollowed: boolean;
}

export interface DisciplineData {
  alerts: Alert[];
  disciplineScore: number;
  rules: DisciplineRule[];
  streak: number;
}

export interface DisciplineResponse {
  success: boolean;
  data?: DisciplineData;
  message?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

export const getDiscipline = async (): Promise<DisciplineResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/discipline`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to fetch discipline data' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Get discipline error:', error);
    return { success: false, message: 'Network error. Please try again later.' };
  }
};


