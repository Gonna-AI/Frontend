import { supabase } from '../config/supabase';
import type { CustomerGraphFilters, CustomerGraphModel, GraphBuildOptions } from '../types/customerGraph';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MAX_RETRIES = 2;

export async function buildGraphModel(
  _callHistory: unknown[],
  filters: CustomerGraphFilters,
  options: Partial<GraphBuildOptions> = {},
): Promise<CustomerGraphModel> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required to build customer graph');
  }

  const requestBody = JSON.stringify({
    filters,
    enrichWithAI: options.enrichWithAI ?? false,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/api-customer-graph`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: requestBody,
        }
      );

      // Retry on 5xx (edge function boot failures)
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        console.warn(`Customer graph API returned ${response.status}, retrying (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }

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
        for (const profile of data.profiles) {
          if (typeof profile.firstSeen === 'string') {
            profile.firstSeen = new Date(profile.firstSeen);
          }
          if (typeof profile.lastSeen === 'string') {
            profile.lastSeen = new Date(profile.lastSeen);
          }
          if (profile.interactions && Array.isArray(profile.interactions)) {
            for (const interaction of profile.interactions) {
              if (typeof interaction.date === 'string') {
                interaction.date = new Date(interaction.date);
              }
            }
          }
        }
      }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        console.warn(`Customer graph fetch failed, retrying (${attempt + 1}/${MAX_RETRIES})...`, err);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to build customer graph');
}
