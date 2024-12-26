import api from '../config/api';

export interface AnalyticsData {
  total_conversations: number;
  monthly_conversations: Array<{
    month: string;
    count: number;
  }>;
  kb_items: number;
  daily_conversations: number;
  total_clients: number;
}

export const analytics = {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await api.get('/api/analytics');
    return response.data;
  }
}; 