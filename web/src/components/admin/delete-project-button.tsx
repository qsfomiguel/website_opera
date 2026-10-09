"use client";

import { useTransition } from "react";

import { deleteProject } from "@/app/admin/actions";

export function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Eliminar "${name}"? Esta ação não pode ser desfeita.`)) {
          startTransition(() => {
            deleteProject(id);
          });
        }
      }}
      className="font-mono text-xs tracking-widest text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "A eliminar..." : "Eliminar"}
    </button>
  );
}
