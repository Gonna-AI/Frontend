import { useEffect, useState } from "react";

import { fetchJobQueueSummary, subscribeToJobQueue, type JobStageSummary, type PipelineJobStage } from "@/dashboard/lib/pipelineClient";

import { infrastructureGroups as staticGroups, type InfrastructureGroup } from "./components/infrastructure-data";
import { InfrastructureHeader } from "./components/infrastructure-header";
import { ProjectEnvironments } from "./components/project-environments";

// Import this stylesheet in any page or component that renders country flag classes.
import "@/dashboard/styles/flag-icons/flags.css";

function applyLiveJobQueue(
  groups: InfrastructureGroup[],
  summary: Record<PipelineJobStage, JobStageSummary> | null,
): InfrastructureGroup[] {
  if (!summary) return groups;

  return groups.map((group) => {
    if (group.name !== "Job Queue") return group;
    return {
      ...group,
      rows: group.rows.map((row) => {
        const stage = row.platform.name as PipelineJobStage;
        const live = summary[stage];
        if (!live) return row;
        return {
          ...row,
          status: live.status,
          latency: `${live.queued} pending`,
          uptime: `${live.processing} running`,
          plan: `Queue depth: ${live.queued + live.processing}`,
        };
      }),
    };
  });
}

export default function Page() {
  const [jobSummary, setJobSummary] = useState<Record<PipelineJobStage, JobStageSummary> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchJobQueueSummary()
        .then((summary) => {
          if (!cancelled) setJobSummary(summary);
        })
        .catch(() => {
          // Live Stack falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToJobQueue(load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const groups = applyLiveJobQueue(staticGroups, jobSummary);

  return (
    <div className="flex flex-col gap-4">
      <InfrastructureHeader />

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <ProjectEnvironments key={group.name} group={group} />
        ))}
      </div>
    </div>
  );
}
