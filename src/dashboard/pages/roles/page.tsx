import { useEffect, useState } from "react";

import {
  fetchRoles,
  fetchTeamMembers,
  subscribeToTable,
  type PipelineRoleRow,
  type PipelineTeamMemberRow,
} from "@/dashboard/lib/pipelineClient";

import { Roles } from "./components/roles";
import { roles as fallbackRoles, type Role } from "./components/roles-table/data";

function rolesToRows(roleRows: PipelineRoleRow[], members: PipelineTeamMemberRow[]): Role[] {
  return roleRows.map((role) => {
    const userCount = members.filter((m) => m.role.includes(role.role_name)).length;
    const permissionSets = Object.entries(role.permissions)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key.replace(/_/g, " "));

    return {
      role: role.role_name,
      group: role.group_name ?? "Custom roles",
      accessLevel: role.role_name === "Kunde" ? "Read only" : "Scoped",
      users: userCount,
      permissionSets: permissionSets.length > 0 ? permissionSets : ["—"],
      lastReview: "—",
      owner: role.owner_name ?? "System",
      status: "Active",
    };
  });
}

export default function Page() {
  const [roles, setRoles] = useState<Role[]>(fallbackRoles);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchRoles(), fetchTeamMembers()])
        .then(([roleRows, members]) => {
          if (cancelled) return;
          if (roleRows.length === 0) return;
          setRoles(rolesToRows(roleRows, members));
        })
        .catch(() => {
          // Access Control falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribeRoles = subscribeToTable("pipeline_roles", load);
    const unsubscribeMembers = subscribeToTable("pipeline_team_members", load);

    return () => {
      cancelled = true;
      unsubscribeRoles();
      unsubscribeMembers();
    };
  }, []);

  return <Roles roles={roles} />;
}
