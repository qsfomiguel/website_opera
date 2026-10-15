import Link from "next/link";
import { notFound } from "next/navigation";

import { updateTeamMember } from "@/app/admin/actions";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import { requireAdmin } from "@/lib/auth";
import { getTeamMember } from "@/lib/team-store";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const member = await getTeamMember(id);
  if (!member) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/admin/equipa"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Equipa
      </Link>
      <h1 className="mb-10 text-3xl font-medium tracking-tight text-foreground">{member.name}</h1>
      <TeamMemberForm
        action={updateTeamMember.bind(null, id)}
        member={member}
        submitLabel="Guardar"
      />
    </main>
  );
}
