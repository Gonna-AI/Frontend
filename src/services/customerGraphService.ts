import { supabase } from '../config/supabase';
import type { CustomerGraphFilters, CustomerGraphModel, GraphBuildOptions } from '../types/customerGraph';

export async function buildGraphModel(
  callHistory: unknown[],
  filters: CustomerGraphFilters,
  options: Partial<GraphBuildOptions> = {},
): Promise<CustomerGraphModel> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required to build customer graph');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-customer-graph`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        filters,
        enrichWithAI: options.enrichWithAI ?? false,
      }),
    }
  );

  if (!response.ok) {
    let errorMessage = 'Failed to fetch customer graph from API';
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }

  const data: CustomerGraphModel = await response.json();

  // Convert string dates from JSON back to Date objects
  if (data.profiles && Array.isArray(data.profiles)) {
    data.profiles.forEach((profile) => {
      if (typeof profile.firstSeen === 'string') {
        profile.firstSeen = new Date(profile.firstSeen);
      }
      if (typeof profile.lastSeen === 'string') {
        profile.lastSeen = new Date(profile.lastSeen);
      }
      if (profile.interactions && Array.isArray(profile.interactions)) {
        profile.interactions.forEach((interaction) => {
          if (typeof interaction.date === 'string') {
            interaction.date = new Date(interaction.date);
          }
        });
      }
    });
  }

  return data;
}
