import { supabase } from '../config/supabase';
import type {
  ProtectedRevenueReport,
  RescueActionRecord,
  RescueAuditEntry,
  RescueEngineSettings,
  RescuePlaybookTemplate,
} from '../types/rescuePlaybook';

const RESCUE_API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-rescue-playbooks`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiFetch<T>(
  resource: string,
  method: string,
  body?: unknown,
  queryParams?: Record<string, string>,
): Promise<T> {
  const headers = await getAuthHeaders();
  const url = new URL(`${RESCUE_API_BASE}/${resource}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      // Retry on 5xx (edge function boot failures)
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        console.warn(`Rescue API ${resource} returned ${response.status}, retrying (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES && !(lastError.message.startsWith('API error'))) {
        console.warn(`Rescue API ${resource} fetch failed, retrying (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error(`Failed to fetch ${resource}`);
}

// ────── Playbooks ──────

export async function fetchPlaybooks(): Promise<RescuePlaybookTemplate[]> {
  const data = await apiFetch<{ playbooks: RescuePlaybookTemplate[] }>('playbooks', 'GET');
  return data.playbooks;
}

export async function savePlaybook(playbook: RescuePlaybookTemplate): Promise<RescuePlaybookTemplate> {
  const data = await apiFetch<{ playbook: RescuePlaybookTemplate }>('playbooks', 'POST', { playbook });
  return data.playbook;
}

export async function syncPlaybooks(playbooks: RescuePlaybookTemplate[]): Promise<RescuePlaybookTemplate[]> {
  const data = await apiFetch<{ playbooks: RescuePlaybookTemplate[] }>('playbooks', 'PUT', { playbooks });
  return data.playbooks;
}

export async function deletePlaybook(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>('playbooks', 'DELETE', { id });
}

// ────── Settings ──────

export async function fetchSettings(): Promise<RescueEngineSettings> {
  const data = await apiFetch<{ settings: RescueEngineSettings }>('settings', 'GET');
  return data.settings;
}

export async function saveSettings(settings: RescueEngineSettings): Promise<RescueEngineSettings> {
  const data = await apiFetch<{ settings: RescueEngineSettings }>('settings', 'PUT', { settings });
  return data.settings;
}

// ────── Actions ──────

export async function fetchActions(): Promise<RescueActionRecord[]> {
  const data = await apiFetch<{ actions: RescueActionRecord[] }>('actions', 'GET');
  return data.actions;
}

export async function saveAction(action: RescueActionRecord): Promise<RescueActionRecord> {
  const data = await apiFetch<{ action: RescueActionRecord }>('actions', 'POST', { action });
  return data.action;
}

export async function updateAction(action: RescueActionRecord): Promise<RescueActionRecord> {
  const data = await apiFetch<{ action: RescueActionRecord }>('actions', 'PUT', { action });
  return data.action;
}

// ────── Audits ──────

export async function fetchAudits(limit = 100): Promise<RescueAuditEntry[]> {
  const data = await apiFetch<{ audits: RescueAuditEntry[] }>(
    'audits',
    'GET',
    undefined,
    { limit: String(limit) },
  );
  return data.audits;
}

export async function saveAudit(audit: RescueAuditEntry): Promise<RescueAuditEntry> {
  const data = await apiFetch<{ audit: RescueAuditEntry }>('audits', 'POST', { audit });
  return data.audit;
}

// ────── Reports ──────

export async function fetchReports(): Promise<ProtectedRevenueReport[]> {
  const data = await apiFetch<{ reports: ProtectedRevenueReport[] }>('reports', 'GET');
  return data.reports;
}

export async function saveReport(report: ProtectedRevenueReport): Promise<ProtectedRevenueReport> {
  const data = await apiFetch<{ report: ProtectedRevenueReport }>('reports', 'POST', { report });
  return data.report;
}
