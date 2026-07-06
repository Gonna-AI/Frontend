import type { SimpleIcon } from "simple-icons";
import { siHetzner, siPostgresql, siPython, siSupabase } from "simple-icons";

export interface InfrastructureEnvironment {
  domain: string;
  domainKey: string;
  platform: {
    name: string;
    icon: SimpleIcon;
  };
  environment: "Expired" | "Production" | "Staging";
  status: "Online" | "Unhealthy" | "Processing";
  latency: string;
  uptime: string;
  server: string;
  serverKey: string;
  countryCode: string;
  plan: string;
  planKey: string;
  resources: {
    cpu: number;
    ram: number;
    disk: number;
  };
}

export interface InfrastructureGroup {
  name: string;
  organization: string;
  rows: InfrastructureEnvironment[];
}

// Groq and Oracle Cloud have no brand icon in the simple-icons package, so we reuse the
// closest available icon (Python for the worker's job runtime, Hetzner as a stand-in for
// bare-metal/VPS-style cloud hosting) purely for a recognizable glyph in the table.
//
// domainKey/serverKey/planKey point at i18n strings in dashboard-infrastructure.ts; the raw
// domain/server/plan fields stay as English/technical fallback values (also used as row keys).
export const infrastructureGroups: InfrastructureGroup[] = [
  {
    name: "Kostencheck Copilot Worker",
    organization: "THD / Gluth Command Center",
    rows: [
      {
        domain: "worker.kostencheck.internal — parse → extract → diff → generate",
        domainKey: "dashInfra.row.kostencheckWorker.domain",
        platform: {
          name: "Oracle VPS Worker (CPU)",
          icon: siHetzner,
        },
        environment: "Production",
        status: "Online",
        latency: "42ms",
        uptime: "61d 14h",
        server: "Oracle Cloud Free Tier (Ampere A1, CPU)",
        serverKey: "dashInfra.row.kostencheckWorker.server",
        countryCode: "DE",
        plan: "VM.Standard.A1.Flex, Frankfurt",
        planKey: "dashInfra.row.kostencheckWorker.plan",
        resources: { cpu: 35, ram: 48, disk: 22 },
      },
    ],
  },
  {
    name: "Inference",
    organization: "Groq Cloud",
    rows: [
      {
        domain: "api.groq.com — llama-3.3-70b-versatile",
        domainKey: "dashInfra.row.groqApi.domain",
        platform: {
          name: "Groq API",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "812ms",
        uptime: "44d 09h",
        server: "Groq LPU Inference Engine",
        serverKey: "dashInfra.row.groqApi.server",
        countryCode: "US",
        plan: "Pay-as-you-go, us-east",
        planKey: "dashInfra.row.groqApi.plan",
        resources: { cpu: 12, ram: 18, disk: 3 },
      },
    ],
  },
  {
    name: "Database & Realtime",
    organization: "Supabase",
    rows: [
      {
        domain: "xlzwfkgurrrspcdyqele.supabase.co — Postgres",
        domainKey: "dashInfra.row.supabasePostgres.domain",
        platform: {
          name: "Supabase Postgres",
          icon: siPostgresql,
        },
        environment: "Production",
        status: "Online",
        latency: "18ms",
        uptime: "61d 14h",
        server: "Supabase Managed Postgres 15",
        serverKey: "dashInfra.row.supabasePostgres.server",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
        planKey: "dashInfra.row.supabasePostgres.plan",
        resources: { cpu: 21, ram: 39, disk: 17 },
      },
      {
        domain: "xlzwfkgurrrspcdyqele.supabase.co — Realtime",
        domainKey: "dashInfra.row.supabaseRealtime.domain",
        platform: {
          name: "Supabase Realtime",
          icon: siSupabase,
        },
        environment: "Production",
        status: "Online",
        latency: "24ms",
        uptime: "61d 14h",
        server: "Supabase Realtime (Phoenix/Elixir)",
        serverKey: "dashInfra.row.supabaseRealtime.server",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
        planKey: "dashInfra.row.supabaseRealtime.plan",
        resources: { cpu: 9, ram: 14, disk: 2 },
      },
      {
        domain: "xlzwfkgurrrspcdyqele.supabase.co — pgvector",
        domainKey: "dashInfra.row.pgvectorIndex.domain",
        platform: {
          name: "pgvector Index",
          icon: siSupabase,
        },
        environment: "Production",
        status: "Online",
        latency: "31ms",
        uptime: "61d 14h",
        server: "pgvector extension on Supabase Postgres",
        serverKey: "dashInfra.row.pgvectorIndex.server",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
        planKey: "dashInfra.row.pgvectorIndex.plan",
        resources: { cpu: 14, ram: 22, disk: 9 },
      },
    ],
  },
  {
    name: "Job Queue",
    organization: "Kostencheck Pipeline Stages",
    rows: [
      {
        domain: "stage: parse — Angebot/Bestellung PDF → structured text",
        domainKey: "dashInfra.row.stageParse.domain",
        platform: {
          name: "parse",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "1 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        serverKey: "dashInfra.row.stageParse.server",
        countryCode: "DE",
        plan: "Queue depth: 1",
        planKey: "dashInfra.row.stageParse.plan",
        resources: { cpu: 28, ram: 30, disk: 5 },
      },
      {
        domain: "stage: extract — line items, quantities, prices, clauses",
        domainKey: "dashInfra.row.stageExtract.domain",
        platform: {
          name: "extract",
          icon: siPython,
        },
        environment: "Production",
        status: "Processing",
        latency: "1 running",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        serverKey: "dashInfra.row.stageExtract.server",
        countryCode: "DE",
        plan: "Queue depth: 1",
        planKey: "dashInfra.row.stageParse.plan",
        resources: { cpu: 41, ram: 36, disk: 5 },
      },
      {
        domain: "stage: diff — Bestellung vs Angebot comparison",
        domainKey: "dashInfra.row.stageDiff.domain",
        platform: {
          name: "diff",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "0 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        serverKey: "dashInfra.row.stageDiff.server",
        countryCode: "DE",
        plan: "Queue depth: 0",
        planKey: "dashInfra.row.stageParse.plan",
        resources: { cpu: 19, ram: 24, disk: 4 },
      },
      {
        domain: "stage: generate — Zusammenfassung, KickOff-Brief, AB-Entwurf",
        domainKey: "dashInfra.row.stageGenerate.domain",
        platform: {
          name: "generate",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "0 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        serverKey: "dashInfra.row.stageGenerate.server",
        countryCode: "DE",
        plan: "Queue depth: 0",
        planKey: "dashInfra.row.stageParse.plan",
        resources: { cpu: 15, ram: 20, disk: 3 },
      },
    ],
  },
];
