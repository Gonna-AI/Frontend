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
  type: "MATCH" | "QTY_CHANGED" | "PRICE_CHANGED" | "ADDED" | "REMOVED" | "CLAUSE_CHANGED";
  severity: "low" | "medium" | "high";
  impact_eur: number;
  confidence: number;
  needs_review: boolean;
  description: string;
  created_at: string;
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
