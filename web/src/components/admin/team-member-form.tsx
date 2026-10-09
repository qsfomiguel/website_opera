"use client";

import Image from "next/image";
import { useActionState } from "react";

import type { FormState } from "@/app/admin/actions";
import type { TeamMember } from "@/lib/team-store";

const inputClass =
  "w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/60 focus:outline-none";
const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";

export function TeamMemberForm({
  action,
  member,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  member?: TeamMember;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="name">
          Nome
        </label>
        <input id="name" name="name" required defaultValue={member?.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="role">
          Função
        </label>
        <input id="role" name="role" defaultValue={member?.role} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="roleEn">
          Função (EN)
        </label>
        <input id="roleEn" name="roleEn" defaultValue={member?.roleEn} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          Descrição breve
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={member?.description}
          placeholder="Mostrada como tooltip na página da equipa."
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="descriptionEn">
          Descrição breve (EN)
        </label>
        <textarea
          id="descriptionEn"
          name="descriptionEn"
          rows={3}
          defaultValue={member?.descriptionEn}
          className={inputClass}
        />
      </div>

      {member?.photo ? (
        <div className="sm:col-span-2">
          <label className={labelClass}>Fotografia atual</label>
          <div className="relative aspect-[3/4] w-32 overflow-hidden bg-secondary">
            <Image src={member.photo} alt="" fill sizes="128px" className="object-cover" />
          </div>
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="photo">
          {member ? "Substituir fotografia" : "Fotografia"}
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          className="block text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-xs file:tracking-widest file:text-foreground"
        />
      </div>

      {state.error ? <p className="sm:col-span-2 text-sm text-red-400">{state.error}</p> : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-border px-6 py-3 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50"
        >
          {pending ? "A guardar..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
