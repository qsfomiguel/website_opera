"use client";

import Image from "next/image";
import { useActionState, useRef, useTransition } from "react";

import { addAwardImages, removeAwardImage } from "@/app/admin/actions";
import type { FormState } from "@/app/admin/actions";

const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";

export function AwardImagesUpload({ images }: { images: string[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addAwardImages, {});
  const [isRemoving, startRemoving] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <label className={labelClass}>Imagens de prémios (rodapé)</label>

      {images.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded bg-secondary">
              <Image src={url} alt="" fill sizes="64px" className="object-contain" />
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => startRemoving(() => removeAwardImage(url))}
                className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[10px] tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                remover
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="flex items-center gap-4">
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={() => formRef.current?.requestSubmit()}
          className="block text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-xs file:tracking-widest file:text-foreground"
        />
        {pending ? <span className="font-mono text-xs text-muted-foreground">A enviar...</span> : null}
      </form>

      {state.error ? <p className="mt-2 text-sm text-red-400">{state.error}</p> : null}
    </div>
  );
}
