import z from "zod";

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
