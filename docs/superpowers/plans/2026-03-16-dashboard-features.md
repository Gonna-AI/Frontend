# Dashboard Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 5 independent dashboard features: fix API key creation bug, add AI-driven playbooks, time-limited team invites, full settings endpoints, and playbook-based customer graph actions.

**Architecture:** Five modular Supabase edge functions (api-keys, playbooks, team-invites, user-settings, actions) + corresponding frontend components with proper error handling, loading states, and real-time UI updates.

**Tech Stack:** Supabase edge functions (Deno), React, TypeScript, Groq AI for playbook generation

---

## File Structure

### Edge Functions (Supabase)
- **Fix:** `supabase/functions/api-keys/index.ts` — Add error handling, fix POST response
- **Modify:** `supabase/functions/playbooks/index.ts` — NEW: Analyze call history + Groq AI generation
- **Create:** `supabase/functions/team-invites/index.ts` — NEW: Time-limited invite link management
- **Create:** `supabase/functions/user-settings/index.ts` — NEW: User preferences CRUD
- **Create:** `supabase/functions/actions/index.ts` — NEW: Playbook-based action listing

### Frontend Components
- **Modify:** `src/components/DashboardViews/KeysView.tsx` — Add error state, auto-refresh, loading spinner
- **Modify:** `src/components/DashboardViews/PlaybooksView.tsx` — NEW: Date range picker + AI generation UI
- **Modify:** `src/components/DashboardViews/SettingsView.tsx` — Refactor for endpoint persistence
- **Modify:** `src/pages/DemoDashboard.tsx` — Add teams/invites UI section
- **Modify:** `src/components/DemoCall/CustomerGraphView.tsx` — Show playbook-generated actions

### Database Migrations
- **Create:** `supabase/migrations/add_team_invites.sql` — NEW table: team_invites
- **Create:** `supabase/migrations/add_playbook_templates.sql` — NEW table: playbook_templates
- **Create:** `supabase/migrations/add_user_settings.sql` — NEW table: user_settings

---

## Chunk 1: API Keys Fix

### Task 1: Add error state and loading to KeysView

**Files:**
- Modify: `src/components/DashboardViews/KeysView.tsx:20-50`

- [ ] **Step 1: Add error and loading states to component**

```typescript
// Around line 25, add these states:
const [createKeyError, setCreateKeyError] = useState<string | null>(null);
const [isCreatingKey, setIsCreatingKey] = useState(false);
```

- [ ] **Step 2: Update resetForm to clear error**

```typescript
const resetForm = () => {
    setNewKeyName('');
    setNewKeyPermissions(['voice', 'text']);
    setNewKeyRateLimit(100);
    setWizardStep('name');
    setCreatedKeyToken(null);
    setCreateKeyError(null);  // Add this line
};
```

- [ ] **Step 3: Wrap createKey in try-catch with loading states**

```typescript
const createKey = async () => {
    if (!user?.id) return;

    setIsCreatingKey(true);
    setCreateKeyError(null);

    try {
        const headers = await getAuthHeaders();
        const res = await fetch(apiBase, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: newKeyName,
                permissions: newKeyPermissions,
                rate_limit: newKeyRateLimit
            })
        });
        const result = await res.json();

        if (res.ok && result.key) {
            const data = result.key;
            const newKey: ApiKey = {
                id: data.id,
                name: data.name,
                token: data.token,
                created: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                lastUsed: 'Never',
                status: data.status,
                permissions: data.permissions || [],
                rateLimit: data.rate_limit
            };
            setKeys([newKey, ...keys]);
            setCreatedKeyToken(data.token);
            setWizardStep('created');
        } else {
            setCreateKeyError(result.error || 'Failed to create API key');
        }
    } catch (err) {
        console.error('Failed to create API key:', err);
        setCreateKeyError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
        setIsCreatingKey(false);
    }
};
```

- [ ] **Step 4: Add error display in modal (around line 735)**

Find the modal content section and add error display before the wizard steps:

```typescript
{/* Error Alert */}
{createKeyError && (
    <div className={cn(
        "p-4 rounded-lg flex items-start gap-3 mb-4",
        isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200"
    )}>
        <AlertTriangle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isDark ? "text-red-400" : "text-red-600")} />
        <div>
            <p className={cn("text-sm font-medium", isDark ? "text-red-400" : "text-red-700")}>
                {createKeyError}
            </p>
        </div>
    </div>
)}
```

- [ ] **Step 5: Add loading spinner and disable button during creation**

In the nextStep function around line 194-195, update the confirm step to call createKey with proper handling:

```typescript
case 'confirm':
    createKey();  // This already calls it, no change needed
    break;
```

Then in the modal footer (around line 760), find the "Next" button and update it:

```typescript
<button
    onClick={nextStep}
    disabled={isCreatingKey || !canProceed()}
    className={cn(
        "flex-1 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
        isCreatingKey
            ? (isDark ? "bg-white/50 text-black/50 cursor-not-allowed" : "bg-black/50 text-white/50 cursor-not-allowed")
            : (isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")
    )}
>
    {isCreatingKey && <Loader2 className="w-4 h-4 animate-spin" />}
    {wizardStep === 'confirm' ? t('keys.modal.create') : t('keys.modal.next')}
</button>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/DashboardViews/KeysView.tsx
git commit -m "fix: Add error handling and loading states to API key creation"
```

---

## Chunk 2: Playbooks with AI Analysis

### Task 1: Create playbooks database migration

**Files:**
- Create: `supabase/migrations/add_playbook_templates.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/add_playbook_templates.sql
CREATE TABLE playbook_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_keywords TEXT[] DEFAULT '{}',
    recommended_actions TEXT[] DEFAULT '{}',
    success_indicators TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT CHECK (source IN ('ai_generated', 'manual', 'system')),
    call_analysis_date_range tsrange,
    confidence_score FLOAT DEFAULT 0.75,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_playbook_templates_user ON playbook_templates(user_id);
CREATE INDEX idx_playbook_templates_created ON playbook_templates(created_at DESC);

-- Enable RLS
ALTER TABLE playbook_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playbooks"
    ON playbook_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playbooks"
    ON playbook_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
    ON playbook_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
    ON playbook_templates FOR DELETE
    USING (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration**

```bash
cd supabase
supabase migration up
```

Expected: Migration applies successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/add_playbook_templates.sql
git commit -m "db: Add playbook_templates table with RLS policies"
```

---

### Task 2: Create playbooks edge function

**Files:**
- Create: `supabase/functions/playbooks/index.ts`

- [ ] **Step 1: Create edge function with full implementation**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

async function analyzeCallHistoryWithAI(
  calls: any[],
  apiKey: string
): Promise<{ templates: any[]; error?: string }> {
  try {
    // Prepare call transcripts for analysis
    const callSummaries = calls
      .slice(0, 20)  // Last 20 calls
      .map(call => ({
        duration: call.duration,
        category: call.category,
        priority: call.priority,
        sentiment: call.summary?.sentiment,
        mainPoints: call.summary?.mainPoints || [],
        topics: call.summary?.topics || [],
      }));

    const prompt = `Analyze these ${callSummaries.length} call records and identify patterns that could become reusable playbook templates:

${JSON.stringify(callSummaries, null, 2)}

For each distinct pattern you identify, create a playbook template with:
1. name: short, descriptive name for the playbook
2. description: what situations trigger this playbook
3. trigger_keywords: array of words/phrases that indicate this scenario
4. recommended_actions: array of suggested actions to take
5. success_indicators: array of metrics/outcomes that show success

Return a JSON array of 3-5 templates. Only return valid JSON, no other text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Could not extract JSON from AI response');

    const templates = JSON.parse(jsonMatch[0]);
    return { templates };
  } catch (error) {
    return {
      templates: [],
      error: error instanceof Error ? error.message : 'AI analysis failed',
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    // Authenticate user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── POST: Generate playbooks from call history ─────────────────
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const startDate = body.start_date as string;
      const endDate = body.end_date as string;

      if (!startDate || !endDate) {
        return jsonResponse(req, 400, { error: 'start_date and end_date required' });
      }

      // Fetch user's calls in date range
      const { data: calls, error: callsError } = await adminClient
        .from('call_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (callsError) throw callsError;

      if (!calls || calls.length === 0) {
        return jsonResponse(req, 400, { error: 'No calls found in date range' });
      }

      // Call AI to analyze and generate templates
      const { templates, error: aiError } = await analyzeCallHistoryWithAI(calls, groqApiKey);

      if (aiError) {
        return jsonResponse(req, 500, { error: aiError });
      }

      // Save templates to database
      const templateRecords = templates.map((t: any) => ({
        user_id: user.id,
        name: t.name,
        description: t.description,
        trigger_keywords: t.trigger_keywords,
        recommended_actions: t.recommended_actions,
        success_indicators: t.success_indicators,
        source: 'ai_generated',
        call_analysis_date_range: `["${startDate}","${endDate}"]`,
        confidence_score: 0.8,
      }));

      const { data: saved, error: saveError } = await adminClient
        .from('playbook_templates')
        .insert(templateRecords)
        .select();

      if (saveError) throw saveError;

      return jsonResponse(req, 201, { templates: saved });
    }

    // ─── GET: List playbooks ───────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('playbook_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jsonResponse(req, 200, { playbooks: data });
    }

    // ─── DELETE: Remove playbook ────────────────────────────────────
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) {
        return jsonResponse(req, 400, { error: 'Missing id' });
      }

      const { error } = await adminClient
        .from('playbook_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[playbooks] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
```

- [ ] **Step 2: Deploy edge function**

```bash
supabase functions deploy playbooks
```

Expected: Function deployed successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/playbooks/index.ts
git commit -m "feat: Add playbooks edge function with AI-driven template generation"
```

---

### Task 3: Add playbooks UI to dashboard

**Files:**
- Modify: `src/pages/DemoDashboard.tsx` — Add playbooks tab
- Modify: `src/components/DashboardViews/PlaybooksView.tsx` — NEW component

- [ ] **Step 1: Create PlaybooksView component**

```typescript
// src/components/DashboardViews/PlaybooksView.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Calendar, Wand2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger_keywords: string[];
  recommended_actions: string[];
  success_indicators: string[];
  created_at: string;
  confidence_score: number;
}

export default function PlaybooksView({ isDark = true }: { isDark?: boolean }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const playbacksBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/playbooks`;

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadPlaybooks = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbacksBase, { headers });
      const result = await res.json();
      if (res.ok && result.playbooks) {
        setPlaybooks(result.playbooks);
      }
    } catch (err) {
      setError('Failed to load playbooks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlaybooks = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Select both start and end dates');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(playbacksBase, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          start_date: dateRange.start,
          end_date: dateRange.end,
        }),
      });

      const result = await res.json();
      if (res.ok && result.templates) {
        setPlaybooks(result.templates);
        setDateRange({ start: '', end: '' });
      } else {
        setError(result.error || 'Failed to generate playbooks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const deletePlaybook = async (id: string) => {
    if (!confirm('Delete this playbook?')) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${playbacksBase}?id=${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setPlaybooks(playbooks.filter(p => p.id !== id));
      }
    } catch (err) {
      setError('Failed to delete playbook');
      console.error(err);
    }
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  return (
    <div className={cn(
      "p-6 rounded-xl border",
      isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
    )}>
      <div className="mb-6">
        <h2 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-black")}>
          AI Playbook Templates
        </h2>
        <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-600")}>
          Analyze your call history and generate playbook templates with AI
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={cn(
          "p-4 rounded-lg flex gap-3 mb-4",
          isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200"
        )}>
          <AlertCircle className={cn("w-5 h-5 flex-shrink-0", isDark ? "text-red-400" : "text-red-600")} />
          <p className={cn("text-sm", isDark ? "text-red-400" : "text-red-700")}>{error}</p>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <label className={cn("text-sm font-medium block mb-3", isDark ? "text-white/80" : "text-gray-700")}>
          Select Date Range for Analysis
        </label>
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className={cn(
              "flex-1 px-3 py-2 rounded border text-sm",
              isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
            )}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className={cn(
              "flex-1 px-3 py-2 rounded border text-sm",
              isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
            )}
          />
        </div>
        <button
          onClick={generatePlaybooks}
          disabled={isGenerating || !dateRange.start || !dateRange.end}
          className={cn(
            "w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors",
            isGenerating || !dateRange.start || !dateRange.end
              ? (isDark ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
              : (isDark ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-purple-500 hover:bg-purple-600 text-white")
          )}
        >
          {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
          <Wand2 className="w-4 h-4" />
          Generate Playbooks
        </button>
      </div>

      {/* Playbooks List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-white/40" : "text-gray-400")} />
        </div>
      ) : playbooks.length === 0 ? (
        <div className="text-center py-8">
          <p className={cn("text-sm", isDark ? "text-white/60" : "text-gray-600")}>
            No playbooks yet. Select a date range and generate from your call history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {playbooks.map((playbook) => (
            <div
              key={playbook.id}
              className={cn(
                "p-4 rounded-lg border",
                isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={cn("font-semibold", isDark ? "text-white" : "text-black")}>
                    {playbook.name}
                  </h3>
                  <p className={cn("text-xs mt-1", isDark ? "text-white/60" : "text-gray-600")}>
                    {playbook.description}
                  </p>
                </div>
                <button
                  onClick={() => deletePlaybook(playbook.id)}
                  className={cn(
                    "p-2 rounded transition-colors",
                    isDark ? "hover:bg-red-500/10 text-white/40 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-600"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className={cn("font-medium mb-1", isDark ? "text-white/60" : "text-gray-600")}>
                    Triggers
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {playbook.trigger_keywords.map((k) => (
                      <span
                        key={k}
                        className={cn(
                          "px-2 py-0.5 rounded",
                          isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={cn("font-medium mb-1", isDark ? "text-white/60" : "text-gray-600")}>
                    Actions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {playbook.recommended_actions.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className={cn(
                          "px-2 py-0.5 rounded",
                          isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                        )}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add playbooks tab to DemoDashboard**

Find where tabs are defined (around line 80-100 in DemoDashboard.tsx) and add:

```typescript
playbooks: t('sidebar.playbooks'),  // Add to labelMap
```

Then add to the render section (around line 212):

```typescript
{activeTab === 'playbooks' && <PlaybooksView isDark={isDark} />}
```

And add import at top:

```typescript
import PlaybooksView from '../components/DashboardViews/PlaybooksView';
```

- [ ] **Step 3: Add playbooks menu item to AppSidebar**

In `src/components/AppSidebar.tsx`, add to the AI Configuration Group (around line 230):

```typescript
<SidebarMenuItem>
    <SidebarMenuButton
        isActive={activeTab === 'playbooks'}
        onClick={() => handleTabClick('playbooks')}
        className={menuButtonClass}
    >
        <Wand2 />
        <span>{t('sidebar.playbooks')}</span>
    </SidebarMenuButton>
</SidebarMenuItem>
```

And add `Wand2` to imports:

```typescript
import { Wand2, /* ... other imports */ } from 'lucide-react';
```

- [ ] **Step 4: Commit**

```bash
git add src/components/DashboardViews/PlaybooksView.tsx src/pages/DemoDashboard.tsx src/components/AppSidebar.tsx
git commit -m "feat: Add playbooks UI with AI-driven template generation from call history"
```

---

## Chunk 3: Team Invites with Time-Limited Links

### Task 1: Create team_invites table

**Files:**
- Create: `supabase/migrations/add_team_invites.sql`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/add_team_invites.sql
CREATE TABLE team_invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invite_code TEXT NOT NULL UNIQUE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('active', 'expired', 'used')) DEFAULT 'active'
);

CREATE INDEX idx_team_invites_team ON team_invites(team_id);
CREATE INDEX idx_team_invites_code ON team_invites(invite_code);
CREATE INDEX idx_team_invites_status ON team_invites(status);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team invites"
    ON team_invites FOR SELECT
    USING (created_by = auth.uid() OR used_by = auth.uid());

CREATE POLICY "Team members can create invites"
    ON team_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.team_id = team_invites.team_id
            AND team_members.user_id = auth.uid()
        )
    );
```

- [ ] **Step 2: Apply migration**

```bash
supabase migration up
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/add_team_invites.sql
git commit -m "db: Add team_invites table for time-limited invite links"
```

---

### Task 2: Create team-invites edge function

**Files:**
- Create: `supabase/functions/team-invites/index.ts`

- [ ] **Step 1: Create function**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 24; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── POST: Create new invite link ───────────────────────────────
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const teamId = body.team_id as string;
      const daysValid = typeof body.days_valid === 'number' ? body.days_valid : 7;

      if (!teamId) {
        return jsonResponse(req, 400, { error: 'team_id required' });
      }

      // Verify user is team member
      const { data: member, error: memberError } = await adminClient
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        return jsonResponse(req, 403, { error: 'Not a team member' });
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysValid);

      const { data, error } = await adminClient
        .from('team_invites')
        .insert({
          team_id: teamId,
          invite_code: inviteCode,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const inviteUrl = `${req.headers.get('origin')}/join/${inviteCode}`;

      return jsonResponse(req, 201, {
        invite: data,
        invite_url: inviteUrl,
      });
    }

    // ─── GET: List invites for team ─────────────────────────────────
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const teamId = url.searchParams.get('team_id');

      if (!teamId) {
        return jsonResponse(req, 400, { error: 'team_id required' });
      }

      const { data, error } = await adminClient
        .from('team_invites')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jsonResponse(req, 200, { invites: data || [] });
    }

    // ─── DELETE: Revoke invite link ────────────────────────────────
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const inviteId = url.searchParams.get('id');

      if (!inviteId) {
        return jsonResponse(req, 400, { error: 'id required' });
      }

      const { error } = await adminClient
        .from('team_invites')
        .update({ status: 'expired' })
        .eq('id', inviteId)
        .eq('created_by', user.id);

      if (error) throw error;

      return jsonResponse(req, 200, { success: true });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[team-invites] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
```

- [ ] **Step 2: Deploy function**

```bash
supabase functions deploy team-invites
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/team-invites/index.ts
git commit -m "feat: Add team-invites edge function with time-limited shareable links"
```

---

### Task 3: Add team invites UI

**Files:**
- Modify: `src/components/DashboardViews/TeamView.tsx` — Update "Send Invite" button

- [ ] **Step 1: Update TeamView to use invite links instead of emails**

Find the current "Send Invite" functionality and replace with:

```typescript
const [inviteLink, setInviteLink] = useState<string | null>(null);
const [copiedInvite, setCopiedInvite] = useState(false);

const createInviteLink = async () => {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-invites`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                team_id: currentTeam.id,
                days_valid: 7,
            }),
        });

        const result = await res.json();
        if (res.ok && result.invite_url) {
            setInviteLink(result.invite_url);
        }
    } catch (err) {
        console.error('Failed to create invite link:', err);
    }
};

const copyInviteLink = () => {
    if (inviteLink) {
        navigator.clipboard.writeText(inviteLink);
        setCopiedInvite(true);
        setTimeout(() => setCopiedInvite(false), 2000);
    }
};

// Replace "Send Invite" button with this:
<button
    onClick={createInviteLink}
    className={cn(
        "px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors",
        isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
    )}
>
    <Link className="w-4 h-4" />
    Create Invite Link
</button>

// Add modal to display invite link after creation:
{inviteLink && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className={cn(
            "rounded-xl p-6 max-w-md",
            isDark ? "bg-[#0A0A0A] border border-white/10" : "bg-white border border-black/10"
        )}>
            <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-black")}>
                Share Invite Link
            </h3>
            <p className={cn("text-sm mb-4", isDark ? "text-white/60" : "text-gray-600")}>
                This link expires in 7 days. Share it with team members to join.
            </p>
            <div className={cn(
                "p-3 rounded-lg mb-4 flex items-center gap-2",
                isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"
            )}>
                <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className={cn(
                        "flex-1 bg-transparent text-xs outline-none",
                        isDark ? "text-white/80" : "text-black"
                    )}
                />
                <button
                    onClick={copyInviteLink}
                    className={cn(
                        "p-2 rounded transition-colors",
                        copiedInvite
                            ? (isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600")
                            : (isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-600")
                    )}
                >
                    {copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
            <button
                onClick={() => setInviteLink(null)}
                className={cn(
                    "w-full py-2 rounded-lg font-medium text-sm",
                    isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                )}
            >
                Done
            </button>
        </div>
    </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DashboardViews/TeamView.tsx
git commit -m "feat: Replace email invites with shareable time-limited links in Teams page"
```

---

## Chunk 4: User Settings with Supabase Endpoints

### Task 1: Create user_settings table

**Files:**
- Create: `supabase/migrations/add_user_settings.sql`

- [ ] **Step 1: Create migration**

```sql
-- supabase/migrations/add_user_settings.sql
CREATE TABLE user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT FALSE,
    notifications_sms BOOLEAN DEFAULT FALSE,
    privacy_profile_public BOOLEAN DEFAULT FALSE,
    privacy_data_analytics BOOLEAN DEFAULT TRUE,
    team_auto_add_members BOOLEAN DEFAULT FALSE,
    api_rate_limit_alerts BOOLEAN DEFAULT TRUE,
    call_recording_default BOOLEAN DEFAULT FALSE,
    call_transcription_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

- [ ] **Step 2: Apply migration**

```bash
supabase migration up
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/add_user_settings.sql
git commit -m "db: Add user_settings table for persistent user preferences"
```

---

### Task 2: Create user-settings edge function

**Files:**
- Create: `supabase/functions/user-settings/index.ts`

- [ ] **Step 1: Create function**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── GET: Get user settings ─────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await adminClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If no settings exist, return defaults
      if (!data) {
        return jsonResponse(req, 200, {
          settings: {
            user_id: user.id,
            theme: 'dark',
            language: 'en',
            notifications_email: true,
            notifications_push: false,
            notifications_sms: false,
            privacy_profile_public: false,
            privacy_data_analytics: true,
            team_auto_add_members: false,
            api_rate_limit_alerts: true,
            call_recording_default: false,
            call_transcription_enabled: true,
          },
        });
      }

      return jsonResponse(req, 200, { settings: data });
    }

    // ─── PUT: Update user settings ──────────────────────────────────
    if (req.method === 'PUT') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

      // Validate settings
      const allowedFields = [
        'theme',
        'language',
        'notifications_email',
        'notifications_push',
        'notifications_sms',
        'privacy_profile_public',
        'privacy_data_analytics',
        'team_auto_add_members',
        'api_rate_limit_alerts',
        'call_recording_default',
        'call_transcription_enabled',
      ];

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const field of allowedFields) {
        if (field in body) {
          updateData[field] = body[field];
        }
      }

      // Check if settings exist
      const { data: existing } = await adminClient
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        // Update existing
        result = await adminClient
          .from('user_settings')
          .update(updateData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new
        result = await adminClient
          .from('user_settings')
          .insert({ user_id: user.id, ...updateData })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      return jsonResponse(req, 200, { settings: result.data });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[user-settings] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
```

- [ ] **Step 2: Deploy function**

```bash
supabase functions deploy user-settings
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/user-settings/index.ts
git commit -m "feat: Add user-settings edge function with full CRUD operations"
```

---

### Task 3: Update SettingsView to use endpoints

**Files:**
- Modify: `src/components/DashboardViews/SettingsView.tsx` — Refactor to persist through endpoints

- [ ] **Step 1: Refactor SettingsView with endpoint integration**

Replace the component with:

```typescript
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Save, Loader2, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_sms: boolean;
  privacy_profile_public: boolean;
  privacy_data_analytics: boolean;
  team_auto_add_members: boolean;
  api_rate_limit_alerts: boolean;
  call_recording_default: boolean;
  call_transcription_enabled: boolean;
}

export default function SettingsView({ isDark = true }: { isDark?: boolean }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const settingsBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-settings`;

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(settingsBase, { headers });
      const result = await res.json();
      if (res.ok && result.settings) {
        setSettings(result.settings);
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
      setSaveSuccess(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(settingsBase, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });

      const result = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className={cn("w-6 h-6 animate-spin", isDark ? "text-white/40" : "text-gray-400")} />
      </div>
    );
  }

  if (!settings) {
    return <div className={cn("p-4", isDark ? "text-white/60" : "text-gray-600")}>Failed to load settings</div>;
  }

  return (
    <div className={cn(
      "p-6 rounded-xl border",
      isDark ? "bg-[#09090B] border-white/10" : "bg-white border-black/10"
    )}>
      <h2 className={cn("text-xl font-semibold mb-6", isDark ? "text-white" : "text-black")}>
        User Settings
      </h2>

      {error && (
        <div className={cn(
          "p-4 rounded-lg flex gap-3 mb-6",
          isDark ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200"
        )}>
          <AlertCircle className={cn("w-5 h-5", isDark ? "text-red-400" : "text-red-600")} />
          <p className={cn("text-sm", isDark ? "text-red-400" : "text-red-700")}>{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className={cn(
          "p-4 rounded-lg flex gap-3 mb-6",
          isDark ? "bg-green-500/10 border border-green-500/30" : "bg-green-50 border border-green-200"
        )}>
          <Check className={cn("w-5 h-5", isDark ? "text-green-400" : "text-green-600")} />
          <p className={cn("text-sm", isDark ? "text-green-400" : "text-green-700")}>Settings saved successfully</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Appearance */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className={cn("font-semibold mb-4", isDark ? "text-white" : "text-black")}>Appearance</h3>
          <div className="space-y-3">
            <div>
              <label className={cn("text-sm font-medium block mb-2", isDark ? "text-white/80" : "text-gray-700")}>
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded border text-sm",
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
                )}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className={cn("text-sm font-medium block mb-2", isDark ? "text-white/80" : "text-gray-700")}>
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded border text-sm",
                  isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-black"
                )}
              >
                <option value="en">English</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className={cn("font-semibold mb-4", isDark ? "text-white" : "text-black")}>Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'notifications_email', label: 'Email Notifications' },
              { key: 'notifications_push', label: 'Push Notifications' },
              { key: 'notifications_sms', label: 'SMS Notifications' },
              { key: 'api_rate_limit_alerts', label: 'API Rate Limit Alerts' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key as keyof UserSettings] as boolean}
                  onChange={(e) => updateSetting(key as keyof UserSettings, e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className={cn("font-semibold mb-4", isDark ? "text-white" : "text-black")}>Privacy</h3>
          <div className="space-y-3">
            {[
              { key: 'privacy_profile_public', label: 'Make profile public' },
              { key: 'privacy_data_analytics', label: 'Allow analytics data collection' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key as keyof UserSettings] as boolean}
                  onChange={(e) => updateSetting(key as keyof UserSettings, e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className={cn("font-semibold mb-4", isDark ? "text-white" : "text-black")}>Team</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.team_auto_add_members}
              onChange={(e) => updateSetting('team_auto_add_members', e.target.checked)}
              className="w-4 h-4"
            />
            <span className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>
              Auto-add new team members to default group
            </span>
          </label>
        </div>

        {/* Call Preferences */}
        <div className={cn(
          "p-4 rounded-lg border",
          isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
        )}>
          <h3 className={cn("font-semibold mb-4", isDark ? "text-white" : "text-black")}>Call Preferences</h3>
          <div className="space-y-3">
            {[
              { key: 'call_recording_default', label: 'Record calls by default' },
              { key: 'call_transcription_enabled', label: 'Enable transcription' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key as keyof UserSettings] as boolean}
                  onChange={(e) => updateSetting(key as keyof UserSettings, e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={cn("text-sm", isDark ? "text-white/80" : "text-gray-700")}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={cn(
            "w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors",
            isSaving
              ? (isDark ? "bg-white/10 text-white/50 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed")
              : (isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90")
          )}
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DashboardViews/SettingsView.tsx
git commit -m "feat: Refactor SettingsView to persist all preferences through Supabase endpoints"
```

---

## Chunk 5: Customer Graph Actions from Playbooks

### Task 1: Create actions edge function

**Files:**
- Create: `supabase/functions/actions/index.ts`

- [ ] **Step 1: Create function**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsBaseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function corsHeadersFor(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get('Origin');
  const allowedOrigin = requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')
    ? requestOrigin
    : 'https://clerktree.com';
  return {
    ...corsBaseHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
  };
}

function jsonResponse(req: Request, status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeadersFor(req) });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse(req, 401, { error: 'Unauthorized' });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // ─── GET: List actions (from playbook templates) ─────────────────
    if (req.method === 'GET') {
      // Fetch playbook templates - each recommended action becomes an action
      const { data: playbooks, error: playbookError } = await adminClient
        .from('playbook_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playbookError) throw playbookError;

      // Transform recommended_actions from playbooks into actions
      const actions = [];
      for (const playbook of playbooks || []) {
        for (const action of playbook.recommended_actions || []) {
          actions.push({
            id: `${playbook.id}-${action}`,
            name: action,
            playbook_id: playbook.id,
            playbook_name: playbook.name,
            source: 'playbook',
            created_at: playbook.created_at,
          });
        }
      }

      return jsonResponse(req, 200, { actions });
    }

    return jsonResponse(req, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[actions] error:', error);
    return jsonResponse(req, 500, {
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});
```

- [ ] **Step 2: Deploy function**

```bash
supabase functions deploy actions
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/actions/index.ts
git commit -m "feat: Add actions edge function that displays playbook-generated actions"
```

---

### Task 2: Update CustomerGraphView to use new actions

**Files:**
- Modify: `src/components/DemoCall/CustomerGraphView.tsx` — Fetch actions from endpoint

- [ ] **Step 1: Update component to fetch playbook-based actions**

Add to component:

```typescript
const [actions, setActions] = useState([]);
const [isLoadingActions, setIsLoadingActions] = useState(true);

useEffect(() => {
  loadActions();
}, []);

const loadActions = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/actions`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const result = await res.json();
    if (res.ok && result.actions) {
      setActions(result.actions);
    }
  } catch (err) {
    console.error('Failed to load actions:', err);
  } finally {
    setIsLoadingActions(false);
  }
};

// In the render, replace hardcoded actions with:
{isLoadingActions ? (
  <Loader2 className="w-4 h-4 animate-spin" />
) : (
  <div className="space-y-2">
    {actions.map((action) => (
      <button
        key={action.id}
        onClick={() => {/* Create action handler */}}
        className={cn(
          "w-full text-left p-2 rounded text-sm transition-colors",
          isDark ? "hover:bg-white/5 text-white/80" : "hover:bg-gray-100 text-gray-700"
        )}
      >
        {action.name}
        <span className={cn("text-xs ml-2", isDark ? "text-white/40" : "text-gray-400")}>
          from {action.playbook_name}
        </span>
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DemoCall/CustomerGraphView.tsx
git commit -m "feat: Update CustomerGraphView to show playbook-generated actions instead of hardcoded ones"
```

---

## Final Steps

- [ ] **Run all tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Test API key creation flow end-to-end**

1. Open Keys page
2. Click "Create Key"
3. Fill in name, select permissions, set rate limit
4. Confirm creation
5. Verify token displays and doesn't go blank
6. Close modal
7. Verify key appears in list
8. Refresh page
9. Verify key still appears

Expected: Smooth flow without blank screen or data loss

- [ ] **Test playbooks generation**

1. Go to Playbooks tab
2. Select date range
3. Click "Generate Playbooks"
4. Verify AI generates templates
5. Verify templates appear in list
6. Go to Customer Graph
7. Verify "Create Action" shows playbook actions

Expected: Playbooks generated from call history, actions displayed

- [ ] **Test team invites**

1. Go to Teams tab
2. Click "Create Invite Link"
3. Copy link
4. Share/test link (if possible)
5. Verify link expires in 7 days

Expected: Shareable link created successfully

- [ ] **Test settings persistence**

1. Go to Settings
2. Change a setting (e.g., theme)
3. Click Save
4. Verify success message
5. Refresh page
6. Verify setting persisted

Expected: All settings persist through page reload

- [ ] **Final commit**

```bash
git add .
git commit -m "feat: Complete dashboard features implementation

- Fix API key creation with error handling & auto-refresh
- Add AI-driven playbooks from call history analysis
- Time-limited shareable team invite links
- Full settings persistence via Supabase endpoints
- Playbook-generated actions in customer graph"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-16-dashboard-features.md`. Ready to execute?**