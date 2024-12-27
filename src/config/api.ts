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

// Audio handling
export const audioApi = {
  startConversation: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.wav');
    return api.post('/api/conversation/stream', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  stopAIResponse: () => api.post('/api/conversation/stop'),
};

// Document handling
export const documentApi = {
  analyzeDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api; 