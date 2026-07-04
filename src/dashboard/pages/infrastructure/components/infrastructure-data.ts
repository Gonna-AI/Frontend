import type { SimpleIcon } from "simple-icons";
import { siHetzner, siPostgresql, siPython, siSupabase } from "simple-icons";

export interface InfrastructureEnvironment {
  domain: string;
  platform: {
    name: string;
    icon: SimpleIcon;
  };
  environment: "Expired" | "Production" | "Staging";
  status: "Online" | "Unhealthy" | "Processing";
  latency: string;
  uptime: string;
  server: string;
  countryCode: string;
  plan: string;
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
export const infrastructureGroups: InfrastructureGroup[] = [
  {
    name: "Kostencheck Copilot Worker",
    organization: "THD / Gluth Command Center",
    rows: [
      {
        domain: "worker.kostencheck.internal — parse → extract → diff → generate",
        platform: {
          name: "Oracle VPS Worker (CPU)",
          icon: siHetzner,
        },
        environment: "Production",
        status: "Online",
        latency: "42ms",
        uptime: "61d 14h",
        server: "Oracle Cloud Free Tier (Ampere A1, CPU)",
        countryCode: "DE",
        plan: "VM.Standard.A1.Flex, Frankfurt",
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
        platform: {
          name: "Groq API",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "812ms",
        uptime: "44d 09h",
        server: "Groq LPU Inference Engine",
        countryCode: "US",
        plan: "Pay-as-you-go, us-east",
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
        platform: {
          name: "Supabase Postgres",
          icon: siPostgresql,
        },
        environment: "Production",
        status: "Online",
        latency: "18ms",
        uptime: "61d 14h",
        server: "Supabase Managed Postgres 15",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
        resources: { cpu: 21, ram: 39, disk: 17 },
      },
      {
        domain: "xlzwfkgurrrspcdyqele.supabase.co — Realtime",
        platform: {
          name: "Supabase Realtime",
          icon: siSupabase,
        },
        environment: "Production",
        status: "Online",
        latency: "24ms",
        uptime: "61d 14h",
        server: "Supabase Realtime (Phoenix/Elixir)",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
        resources: { cpu: 9, ram: 14, disk: 2 },
      },
      {
        domain: "xlzwfkgurrrspcdyqele.supabase.co — pgvector",
        platform: {
          name: "pgvector Index",
          icon: siSupabase,
        },
        environment: "Production",
        status: "Online",
        latency: "31ms",
        uptime: "61d 14h",
        server: "pgvector extension on Supabase Postgres",
        countryCode: "DE",
        plan: "eu-central-1, Frankfurt",
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
        platform: {
          name: "parse",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "1 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        countryCode: "DE",
        plan: "Queue depth: 1",
        resources: { cpu: 28, ram: 30, disk: 5 },
      },
      {
        domain: "stage: extract — line items, quantities, prices, clauses",
        platform: {
          name: "extract",
          icon: siPython,
        },
        environment: "Production",
        status: "Processing",
        latency: "1 running",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        countryCode: "DE",
        plan: "Queue depth: 1",
        resources: { cpu: 41, ram: 36, disk: 5 },
      },
      {
        domain: "stage: diff — Bestellung vs Angebot comparison",
        platform: {
          name: "diff",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "0 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        countryCode: "DE",
        plan: "Queue depth: 0",
        resources: { cpu: 19, ram: 24, disk: 4 },
      },
      {
        domain: "stage: generate — Zusammenfassung, KickOff-Brief, AB-Entwurf",
        platform: {
          name: "generate",
          icon: siPython,
        },
        environment: "Production",
        status: "Online",
        latency: "0 pending",
        uptime: "0 failed (7d)",
        server: "Oracle VPS Worker (CPU)",
        countryCode: "DE",
        plan: "Queue depth: 0",
        resources: { cpu: 15, ram: 20, disk: 3 },
      },
    ],
  },
];
