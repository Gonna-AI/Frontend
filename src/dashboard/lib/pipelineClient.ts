import { supabase } from "@/config/supabase";

export type PipelineJobStage = "parse" | "extract" | "diff" | "generate";
export type PipelineJobStatus = "queued" | "processing" | "done" | "error";

export interface PipelineJobRow {
  id: string;
  document_id: string;
  stage: PipelineJobStage;
  status: PipelineJobStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobStageSummary {
  queued: number;
  processing: number;
  failedRecent: number;
  status: "Online" | "Processing" | "Unhealthy";
}

const STAGES: PipelineJobStage[] = ["parse", "extract", "diff", "generate"];

function summarize(jobs: PipelineJobRow[]): Record<PipelineJobStage, JobStageSummary> {
  const summary = Object.fromEntries(
    STAGES.map((stage) => [stage, { queued: 0, processing: 0, failedRecent: 0, status: "Online" as const }]),
  ) as Record<PipelineJobStage, JobStageSummary>;

  for (const job of jobs) {
    const bucket = summary[job.stage];
    if (!bucket) continue;
    if (job.status === "queued") bucket.queued += 1;
    if (job.status === "processing") bucket.processing += 1;
    if (job.status === "error") bucket.failedRecent += 1;
  }

  for (const stage of STAGES) {
    const bucket = summary[stage];
    bucket.status = bucket.failedRecent > 0 ? "Unhealthy" : bucket.processing > 0 ? "Processing" : "Online";
  }

  return summary;
}

/** Jobs from the last 7 days, newest first — enough to summarize queue depth and recent failures. */
export async function fetchJobQueueSummary(): Promise<Record<PipelineJobStage, JobStageSummary>> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("pipeline_jobs")
    .select("id, document_id, stage, status, error_message, created_at, updated_at")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return summarize((data ?? []) as PipelineJobRow[]);
}

/** Fires `onChange` whenever a pipeline_jobs row is inserted or updated. Returns an unsubscribe function. */
export function subscribeToJobQueue(onChange: () => void): () => void {
  const channel = supabase
    .channel("pipeline_jobs_live")
    .on("postgres_changes", { event: "*", schema: "public", table: "pipeline_jobs" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface PipelineDeviationRow {
  id: string;
  project_id: string;
  quote_line_item_id: string | null;
  order_line_item_id: string | null;
  type: "MATCH" | "QTY_CHANGED" | "PRICE_CHANGED" | "ADDED" | "REMOVED" | "CLAUSE_CHANGED";
  severity: "low" | "medium" | "high";
  impact_eur: number;
  confidence: number;
  needs_review: boolean;
  description: string;
  created_at: string;
}

export interface PipelineLineItemRow {
  id: string;
  document_id: string;
  position_no: number | null;
  article_no: string | null;
  description: string | null;
  qty: number | null;
  unit_price: number | null;
  delivery_date: string | null;
}

export async function fetchLineItemsForDocument(documentId: string): Promise<PipelineLineItemRow[]> {
  const { data, error } = await supabase
    .from("pipeline_line_items")
    .select("*")
    .eq("document_id", documentId)
    .order("position_no");
  if (error) throw error;
  return (data ?? []) as PipelineLineItemRow[];
}

export interface PipelineProjectRow {
  id: string;
  company_id: string;
  name: string;
  customer_name: string | null;
  status: "active" | "ab_issued" | "closed";
  created_at: string;
}

/** Most recently created project across all monitored companies — the one the live demo run creates or the seeded flagship one. */
export async function fetchLatestProject(): Promise<PipelineProjectRow | null> {
  const { data, error } = await supabase
    .from("pipeline_projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as PipelineProjectRow | null;
}

export async function fetchDeviationsForProject(projectId: string): Promise<PipelineDeviationRow[]> {
  const { data, error } = await supabase
    .from("pipeline_deviations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PipelineDeviationRow[];
}

/** Fires `onChange` whenever a pipeline_deviations row is inserted for this project. Returns an unsubscribe function. */
export function subscribeToDeviations(projectId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`pipeline_deviations_${projectId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "pipeline_deviations", filter: `project_id=eq.${projectId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Generic realtime helper for tables not covered by a dedicated subscribe* function above. */
export function subscribeToTable(table: string, onChange: () => void, filter?: string): () => void {
  const channelName = `${table}_live${filter ? `_${filter}` : ""}`;
  let builder = supabase.channel(channelName);
  builder = filter
    ? builder.on("postgres_changes", { event: "*", schema: "public", table, filter }, onChange)
    : builder.on("postgres_changes", { event: "*", schema: "public", table }, onChange);
  const channel = builder.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export interface PipelineCompanyRow {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
}

export async function fetchCompanies(): Promise<PipelineCompanyRow[]> {
  const { data, error } = await supabase.from("pipeline_companies").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as PipelineCompanyRow[];
}

export interface PipelineChecklistItemRow {
  id: string;
  project_id: string;
  label: string;
  category: string | null;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "done";
  created_at: string;
}

export async function fetchChecklistItems(projectId?: string): Promise<PipelineChecklistItemRow[]> {
  let query = supabase.from("pipeline_checklist_items").select("*").order("created_at");
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PipelineChecklistItemRow[];
}

export async function updateChecklistItemStatus(id: string, status: PipelineChecklistItemRow["status"]): Promise<void> {
  const { error } = await supabase.from("pipeline_checklist_items").update({ status }).eq("id", id);
  if (error) throw error;
}

export interface PipelineMilestoneRow {
  id: string;
  project_id: string;
  label: string;
  kind: string | null;
  due_date: string | null;
  status: "pending" | "done";
}

export async function fetchMilestones(projectId?: string): Promise<PipelineMilestoneRow[]> {
  let query = supabase.from("pipeline_milestones").select("*").order("due_date");
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PipelineMilestoneRow[];
}

export interface PipelineGeneratedDocRow {
  id: string;
  project_id: string;
  kind: "zusammenfassung" | "kickoff_brief" | "deviation_report" | "ab_draft";
  title: string | null;
  content: string | null;
  created_at: string;
}

export async function fetchGeneratedDocs(projectId?: string): Promise<PipelineGeneratedDocRow[]> {
  let query = supabase.from("pipeline_generated_docs").select("*").order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PipelineGeneratedDocRow[];
}

export interface PipelineOpportunityRow {
  id: string;
  company_id: string;
  customer_name: string;
  stage: "Anfrage" | "Konzept" | "Kalkulation" | "Angebot" | "Bestellung" | "AB";
  value_eur: number;
  contact_email: string | null;
  updated_at: string;
}

export async function fetchOpportunities(): Promise<PipelineOpportunityRow[]> {
  const { data, error } = await supabase.from("pipeline_crm_opportunities").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineOpportunityRow[];
}

export async function updateOpportunityStage(id: string, stage: PipelineOpportunityRow["stage"]): Promise<void> {
  const { error } = await supabase
    .from("pipeline_crm_opportunities")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export interface PipelineProductRow {
  id: string;
  article_no: string;
  name: string;
  unit_price: number;
  lead_time_weeks: number;
  category: string | null;
  is_long_lead: boolean;
}

export async function fetchProducts(): Promise<PipelineProductRow[]> {
  const { data, error } = await supabase.from("pipeline_products").select("*").order("category");
  if (error) throw error;
  return (data ?? []) as PipelineProductRow[];
}

export interface PipelineShipmentRow {
  id: string;
  project_id: string | null;
  origin: string;
  destination: string;
  status: "pending" | "in_transit" | "delivered" | "on_hold";
  eta_date: string | null;
  note: string | null;
  created_at: string;
}

export async function fetchShipments(): Promise<PipelineShipmentRow[]> {
  const { data, error } = await supabase.from("pipeline_shipments").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineShipmentRow[];
}

export async function updateShipmentStatus(id: string, status: PipelineShipmentRow["status"]): Promise<void> {
  const { error } = await supabase.from("pipeline_shipments").update({ status }).eq("id", id);
  if (error) throw error;
}

export interface PipelineTeamMemberRow {
  id: string;
  name: string;
  role: string;
  team: string | null;
  email: string | null;
  company_id: string | null;
  is_customer_contact: boolean;
  created_at: string;
}

export async function fetchTeamMembers(): Promise<PipelineTeamMemberRow[]> {
  const { data, error } = await supabase.from("pipeline_team_members").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as PipelineTeamMemberRow[];
}

export interface PipelineRoleRow {
  id: string;
  role_name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  group_name: string | null;
  owner_name: string | null;
}

export async function fetchRoles(): Promise<PipelineRoleRow[]> {
  const { data, error } = await supabase.from("pipeline_roles").select("*").order("role_name");
  if (error) throw error;
  return (data ?? []) as PipelineRoleRow[];
}

export interface PipelineDocumentRow {
  id: string;
  company_id: string;
  kind: "angebot" | "bestellung";
  doc_number: string | null;
  status: "uploaded" | "parsing" | "parsed" | "error";
  uploaded_at: string;
}

export async function fetchDocuments(): Promise<PipelineDocumentRow[]> {
  const { data, error } = await supabase.from("pipeline_documents").select("*").order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineDocumentRow[];
}

export async function fetchAllDeviations(): Promise<PipelineDeviationRow[]> {
  const { data, error } = await supabase.from("pipeline_deviations").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineDeviationRow[];
}

export async function fetchAllProjects(): Promise<PipelineProjectRow[]> {
  const { data, error } = await supabase.from("pipeline_projects").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineProjectRow[];
}

export interface PipelineChatThreadRow {
  id: string;
  company_id: string | null;
  title: string;
  created_at: string;
}

export interface PipelineChatMessageRow {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function fetchChatThreads(): Promise<PipelineChatThreadRow[]> {
  const { data, error } = await supabase.from("pipeline_chat_threads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PipelineChatThreadRow[];
}

export async function fetchChatMessages(threadId: string): Promise<PipelineChatMessageRow[]> {
  const { data, error } = await supabase
    .from("pipeline_chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PipelineChatMessageRow[];
}

export async function fetchAllChatMessages(): Promise<PipelineChatMessageRow[]> {
  const { data, error } = await supabase.from("pipeline_chat_messages").select("*");
  if (error) throw error;
  return (data ?? []) as PipelineChatMessageRow[];
}

export interface PipelineHistoricalProjectRow {
  id: string;
  company_id: string;
  title: string;
  summary: string | null;
  outcome: string | null;
  embedding: number[] | string | null;
}

/**
 * Historical projects backing the Project Memory / RAG index.
 * `embedding` is currently NULL for all rows until the VPS worker backfills it —
 * treat embedding === null as "Pending"/"Nicht indiziert", non-null as "Indexed"/"Indiziert".
 */
export async function fetchHistoricalProjects(companySlug?: string): Promise<PipelineHistoricalProjectRow[]> {
  let query = supabase
    .from("pipeline_historical_projects")
    .select("id, company_id, title, summary, outcome, embedding")
    .order("title");

  if (companySlug) {
    // Best-effort filter: if the slug isn't found, fall back to the unfiltered list rather
    // than failing the whole fetch.
    try {
      const { data: company, error: companyError } = await supabase
        .from("pipeline_companies")
        .select("id")
        .eq("slug", companySlug)
        .maybeSingle();

      if (!companyError && company) {
        query = query.eq("company_id", company.id);
      }
    } catch {
      // ignore — unfiltered query below still runs
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PipelineHistoricalProjectRow[];
}

/** Calls the live kostencheck-copilot Edge Function: persists the user message, retrieves */
/** relevant historical projects via pg_trgm, asks Groq, persists + returns the assistant reply. */
export async function askCopilot(params: { message: string; companySlug: string; threadId?: string }) {
  const { data, error } = await supabase.functions.invoke("kostencheck-copilot", {
    body: { message: params.message, company_slug: params.companySlug, thread_id: params.threadId },
  });
  if (error) throw error;
  return data as { thread_id: string; message: PipelineChatMessageRow; matches: unknown[] };
}
