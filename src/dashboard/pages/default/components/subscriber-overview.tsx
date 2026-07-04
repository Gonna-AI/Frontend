
import { useEffect, useState } from "react";

import { Download } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import {
  fetchAllDeviations,
  fetchAllProjects,
  fetchCompanies,
  subscribeToTable,
  type PipelineCompanyRow,
  type PipelineDeviationRow,
  type PipelineProjectRow,
} from "@/dashboard/lib/pipelineClient";

import customersData from "./data.json";
import type { RecentCustomerRow } from "./recent-customers-table/schema";
import { RecentCustomersTable } from "./recent-customers-table/table";

const FALLBACK_CUSTOMERS = customersData as RecentCustomerRow[];

// Deviation severity for a project buckets into the "billing" slots the table was originally built for.
function severityBucket(deviations: PipelineDeviationRow[]): RecentCustomerRow["billing"] {
  if (deviations.length === 0) return "Paid";
  if (deviations.some((d) => d.severity === "high")) return "Overdue";
  if (deviations.some((d) => d.needs_review)) return "Pending";
  if (deviations.some((d) => d.severity === "medium")) return "Trial";
  return "Paid";
}

// Review state ("status" slot): escalated if any high-severity deviation still needs review, in review if
// any deviation needs review at all, otherwise clean.
function reviewStatus(deviations: PipelineDeviationRow[]): RecentCustomerRow["status"] {
  if (deviations.some((d) => d.severity === "high" && d.needs_review)) return "Unsubscribed";
  if (deviations.some((d) => d.needs_review)) return "Inactive";
  return "Subscribed";
}

function projectsToRows(
  projects: PipelineProjectRow[],
  companies: PipelineCompanyRow[],
  deviations: PipelineDeviationRow[],
): RecentCustomerRow[] {
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const deviationsByProject = new Map<string, PipelineDeviationRow[]>();
  for (const deviation of deviations) {
    const bucket = deviationsByProject.get(deviation.project_id) ?? [];
    bucket.push(deviation);
    deviationsByProject.set(deviation.project_id, bucket);
  }

  return projects.map((project) => {
    const company = companyById.get(project.company_id);
    const projectDeviations = deviationsByProject.get(project.id) ?? [];
    const slug = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      id: project.id,
      name: project.name,
      email: `${slug}@${(company?.slug ?? "pipeline").toLowerCase()}.projects`,
      plan: company?.name ?? "—",
      status: reviewStatus(projectDeviations),
      billing: severityBucket(projectDeviations),
      joined: project.created_at,
    };
  });
}

export function SubscriberOverview() {
  const [rows, setRows] = useState<RecentCustomerRow[]>(FALLBACK_CUSTOMERS);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchAllProjects(), fetchCompanies(), fetchAllDeviations()])
        .then(([projects, companies, deviations]) => {
          if (cancelled) return;
          if (projects.length === 0) return;
          setRows(projectsToRows(projects, companies, deviations));
        })
        .catch(() => {
          // Keep showing the static seed snapshot if Supabase is briefly unreachable.
        });
    };

    load();
    const unsubscribeProjects = subscribeToTable("pipeline_projects", load);
    const unsubscribeDeviations = subscribeToTable("pipeline_deviations", load);

    return () => {
      cancelled = true;
      unsubscribeProjects();
      unsubscribeDeviations();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Active & Recent Projects</CardTitle>
        <CardDescription>
          Bestellung-vs-Angebot comparisons across THD GmbH, Weber Präzisionstechnik, and MK Anlagenbau — with
          company, review status, and severity.
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <Download />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0">
        <RecentCustomersTable data={rows} />
      </CardContent>
    </Card>
  );
}
