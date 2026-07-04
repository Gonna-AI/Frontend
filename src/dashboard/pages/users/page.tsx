import { useEffect, useState } from "react";

import {
  fetchCompanies,
  fetchTeamMembers,
  subscribeToTable,
  type PipelineCompanyRow,
  type PipelineTeamMemberRow,
} from "@/dashboard/lib/pipelineClient";

import { users as fallbackUsers, type UserRow, type UserTeam } from "./components/data";
import { Users } from "./components/users";

const VALID_TEAMS: UserTeam[] = [
  "Vertrieb",
  "Kalkulation",
  "Auftragsabwicklung",
  "Technik",
  "Kostencheck",
  "Compliance",
  "Einkauf",
  "Finanzen",
  "Kunde",
];

function teamMembersToRows(members: PipelineTeamMemberRow[], companies: PipelineCompanyRow[]): UserRow[] {
  const companyById = new Map(companies.map((c) => [c.id, c]));

  return members.map((member) => {
    const company = member.company_id ? companyById.get(member.company_id) : undefined;
    const team = VALID_TEAMS.includes(member.team as UserTeam) ? (member.team as UserTeam) : "Kostencheck";

    return {
      name: member.name,
      email: member.email ?? "—",
      role: member.role,
      status: "Active",
      team,
      workspace: [
        company?.name ?? "ClerkTree",
        ...(member.is_customer_contact ? [] : ["Kostencheck Copilot"]),
      ],
      joinedDate: new Date(member.created_at).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      lastActive: 0,
    };
  });
}

export default function Page() {
  const [users, setUsers] = useState<UserRow[]>(fallbackUsers);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchTeamMembers(), fetchCompanies()])
        .then(([members, companies]) => {
          if (cancelled) return;
          if (members.length === 0) return;
          setUsers(teamMembersToRows(members, companies));
        })
        .catch(() => {
          // Team & Contacts falls back to the static demo snapshot if Supabase is unreachable.
        });
    };

    load();
    const unsubscribe = subscribeToTable("pipeline_team_members", load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <Users users={users} />;
}
