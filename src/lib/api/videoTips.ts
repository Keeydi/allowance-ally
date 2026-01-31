// Video Tips API Service
// Functions for fetching and managing video tips

export interface VideoTip {
  id: string | number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  createdAt: string;
}

export interface VideoTipsResponse {
  success: boolean;
  videos?: VideoTip[];
  video?: VideoTip;
  message?: string;
}

// API Base URL
import { API_BASE_URL } from '@/lib/api/config';

/**
 * Get all video tips (for users - no auth required)
 * @returns VideoTipsResponse with array of videos
 */
export const getAllVideoTips = async (): Promise<VideoTipsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/video-tips`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch video tips'
      };
    }

    return {
      success: true,
      videos: data.videos || []
    };
  } catch (error) {
    console.error('Get video tips error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

/**
 * Get all video tips (admin only - for management)
 * @returns VideoTipsResponse with array of videos
 */
export const getAdminVideoTips = async (): Promise<VideoTipsResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/video-tips`, {
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
        message: data.message || 'Failed to fetch video tips'
      };
    }

    return {
      success: true,
      videos: data.videos || []
    };
  } catch (error) {
    console.error('Get admin video tips error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

/**
 * Create a new video tip (admin only)
 */
export const createVideoTip = async (videoData: {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
}): Promise<VideoTipsResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/video-tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create video tip'
      };
    }

    return {
      success: true,
      video: data.video
    };
  } catch (error) {
    console.error('Create video tip error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

/**
 * Update a video tip (admin only)
 */
export const updateVideoTip = async (
  id: string | number,
  videoData: {
    title: string;
    description: string;
    videoUrl: string;
    category: string;
  }
): Promise<VideoTipsResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/video-tips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update video tip'
      };
    }

    return {
      success: true,
      video: data.video
    };
  } catch (error) {
    console.error('Update video tip error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

/**
 * Delete a video tip (admin only)
 */
export const deleteVideoTip = async (id: string | number): Promise<VideoTipsResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/admin/video-tips/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete video tip'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Delete video tip error:', error);
    return {
      success: false,
      message: 'Network error. Please try again later.'
    };
  }
};

