import Image from "next/image";
import Link from "next/link";

import { moveTeamMemberOrder } from "@/app/admin/actions";
import { DeleteTeamMemberButton } from "@/components/admin/delete-team-member-button";
import { requireAdmin } from "@/lib/auth";
import { getTeam } from "@/lib/team-store";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  await requireAdmin();
  const team = await getTeam();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/admin"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Admin
      </Link>

      <div className="mb-16 flex items-center justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Equipa</h1>
        </div>
        <Link
          href="/admin/equipa/novo"
          className="rounded-full border border-border px-5 py-2.5 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40"
        >
          + Adicionar pessoa
        </Link>
      </div>

      {team.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum membro da equipa.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {team.map((member, i) => (
            <div key={member.id} className="flex items-center gap-4 py-3">
              <div className="flex flex-col">
                <form action={moveTeamMemberOrder.bind(null, member.id, "up")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveTeamMemberOrder.bind(null, member.id, "down")}>
                  <button
                    type="submit"
                    disabled={i === team.length - 1}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>
              <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-secondary">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{member.name}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {member.role || "—"}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/equipa/${member.id}`}
                  className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Editar
                </Link>
                <DeleteTeamMemberButton id={member.id} name={member.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
