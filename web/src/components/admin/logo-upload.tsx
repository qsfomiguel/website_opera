"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import { removeLogo, uploadLogo } from "@/app/admin/actions";
import type { FormState } from "@/app/admin/actions";

// Next.js only serves SVGs through <Image> when optimization is skipped.
const isSvg = (url: string) => /\.svg($|\?)/i.test(url);

const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";

export function LogoUpload({
  currentUrlDark,
  currentUrlLight,
}: {
  currentUrlDark: string;
  currentUrlLight: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(uploadLogo, {});
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

  const hasLogo = Boolean(currentUrlDark || preview);

  return (
    <div>
      <label className={labelClass}>Logotipo</label>
      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="logo"
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
          {preview ? (
            <div className="relative h-16 w-40">
              <Image src={preview} alt="Logotipo" fill sizes="160px" className="object-contain" />
            </div>
          ) : null}
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
            {pending
              ? "A processar (remover fundo, gerar versão clara/escura)..."
              : hasLogo
                ? "Arraste para substituir ou clique para escolher"
                : "Arraste uma imagem ou clique para escolher"}
          </p>
        </div>
      </form>

      {state.error ? <p className="mt-2 text-sm text-red-400">{state.error}</p> : null}

      {!pending && !preview && (currentUrlDark || currentUrlLight) ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="relative flex h-16 items-center justify-center rounded bg-[#15130f] px-4">
              {currentUrlDark ? (
                <Image src={currentUrlDark} alt="Logotipo (cabeçalho)" width={120} height={40} className="h-8 w-auto object-contain" unoptimized={isSvg(currentUrlDark)} />
              ) : null}
            </div>
            <p className="mt-1.5 text-center font-mono text-[11px] text-muted-foreground">Cabeçalho</p>
          </div>
          <div>
            <div className="relative flex h-16 items-center justify-center rounded bg-white px-4">
              {currentUrlLight ? (
                <Image src={currentUrlLight} alt="Logotipo (rodapé)" width={120} height={40} className="h-8 w-auto object-contain" unoptimized={isSvg(currentUrlLight)} />
              ) : null}
            </div>
            <p className="mt-1.5 text-center font-mono text-[11px] text-muted-foreground">Rodapé</p>
          </div>
        </div>
      ) : null}

      {currentUrlDark ? (
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => {
            setPreview(null);
            startRemoving(() => removeLogo());
          }}
          className="mt-3 font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isRemoving ? "A remover..." : "Remover logotipo (usar texto “OPERA”)"}
        </button>
      ) : null}
    </div>
  );
}
