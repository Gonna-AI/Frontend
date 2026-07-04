import z from "zod";

import type { PipelineOpportunityRow } from "@/dashboard/lib/pipelineClient";

const opportunitySchema = z.object({
  id: z.string(),
  account: z.string(),
  stage: z.string(),
  priority: z.number(),
  health: z.string(),
  value: z.string(),
});

export const opportunitiesSchema = z.array(opportunitySchema);

export type OpportunityRow = z.infer<typeof opportunitySchema>;

export const STAGE_OPTIONS = ["Anfrage", "Konzept", "Kalkulation", "Angebot", "Bestellung", "AB"] as const;
export type OpportunityStage = (typeof STAGE_OPTIONS)[number];

// Stage is the only real signal we have per opportunity right now — priority/health are
// heuristics derived from it (later-stage = higher priority/lower risk), not independently
// tracked fields. Honest-but-approximate rather than fabricated from nothing.
const STAGE_PRIORITY: Record<string, number> = {
  Anfrage: 1,
  Konzept: 1,
  Kalkulation: 2,
  Angebot: 2,
  Bestellung: 3,
  AB: 3,
};

const STAGE_HEALTH: Record<string, OpportunityRow["health"]> = {
  Anfrage: "At Risk",
  Konzept: "At Risk",
  Kalkulation: "Needs Review",
  Angebot: "Needs Review",
  Bestellung: "On Track",
  AB: "On Track",
};

export function opportunityRowFromLive(row: PipelineOpportunityRow): OpportunityRow {
  return {
    id: row.id,
    account: row.customer_name,
    stage: row.stage,
    priority: STAGE_PRIORITY[row.stage] ?? 2,
    health: STAGE_HEALTH[row.stage] ?? "Needs Review",
    value: `€${Math.round(row.value_eur).toLocaleString("de-DE")}`,
  };
}
