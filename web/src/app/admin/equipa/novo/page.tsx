import Link from "next/link";

import { createTeamMember } from "@/app/admin/actions";
import { TeamMemberForm } from "@/components/admin/team-member-form";

export default function NewTeamMemberPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/admin/equipa"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Equipa
      </Link>
      <h1 className="mb-10 text-3xl font-medium tracking-tight text-foreground">
        Adicionar pessoa
      </h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Adicionar" />
    </main>
  );
}
