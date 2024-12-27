export const API_BASE_URL = 'http://localhost:5000';

// Create an axios instance with default config
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Notification API endpoints
export const notificationsApi = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (notification_ids: number[]) => 
    api.post('/api/notifications/mark-read', { notification_ids }),
};

export default api; 