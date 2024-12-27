import api from '../config/api';

export interface AnalyticsData {
  total_clients: number;
  total_conversations: number;
  daily_conversations: string;
  monthly_conversations: Array<{
    month: string;
    count: number;
  }>;
  client_data: Record<string, {
    conversation_history: Array<any>;
    first_interaction: string;
    last_interaction: string | null;
    total_conversations: number;
    total_urgent_cases: string;
  }>;
  metrics: {
    avg_response_time: number;
    client_satisfaction: number;
    resolved_cases: number;
    total_cases: number;
  };
}

export const analytics = {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await api.get('/api/analytics');
    return response.data;
  }
}; 