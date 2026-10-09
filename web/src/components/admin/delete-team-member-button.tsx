"use client";

import { useTransition } from "react";

import { deleteTeamMember } from "@/app/admin/actions";

export function DeleteTeamMemberButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Remover "${name}"? Esta ação não pode ser desfeita.`)) {
          startTransition(() => {
            deleteTeamMember(id);
          });
        }
      }}
      className="font-mono text-xs tracking-widest text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "A remover..." : "Remover"}
    </button>
  );
}
