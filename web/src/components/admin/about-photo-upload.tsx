"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import { removeAboutPhoto, uploadAboutPhoto } from "@/app/admin/actions";
import type { FormState } from "@/app/admin/actions";

const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";

export function AboutPhotoUpload({ currentUrl }: { currentUrl: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(uploadAboutPhoto, {});
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isRemoving, startRemoving] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the local preview once the server action confirms success
    if (!state.error) setPreview(null);
  }, [state]);

  function submitFile(file: File) {
    setPreview(URL.createObjectURL(file));
    if (inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
    }
    formRef.current?.requestSubmit();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) submitFile(file);
  }

  const displayUrl = preview ?? currentUrl;

  return (
    <div>
      <label className={labelClass}>Foto de grupo (página Sobre)</label>
      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="photo"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) submitFile(file);
          }}
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
            isDragging ? "border-foreground/60 bg-secondary/40" : "border-border hover:border-foreground/30"
          }`}
        >
          {displayUrl ? (
            <div className="relative aspect-[16/9] w-full max-w-md">
              <Image src={displayUrl} alt="Foto de grupo" fill sizes="400px" className="object-cover" />
            </div>
          ) : null}
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
            {pending
              ? "A enviar..."
              : displayUrl
                ? "Arraste para substituir ou clique para escolher"
                : "Arraste uma imagem ou clique para escolher"}
          </p>
        </div>
      </form>

      {state.error ? <p className="mt-2 text-sm text-red-400">{state.error}</p> : null}

      {currentUrl ? (
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => {
            setPreview(null);
            startRemoving(() => removeAboutPhoto());
          }}
          className="mt-3 font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isRemoving ? "A remover..." : "Remover foto"}
        </button>
      ) : null}
    </div>
  );
}
