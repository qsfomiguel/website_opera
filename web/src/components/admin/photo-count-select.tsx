"use client";

import { useTransition } from "react";

import { setFeaturedPhotoCount } from "@/app/admin/actions";

export function PhotoCountSelect({
  id,
  count,
  max,
}: {
  id: string;
  count: number;
  max: number;
}) {
  const [pending, startTransition] = useTransition();
  const options = Array.from({ length: Math.min(3, Math.max(1, max)) }, (_, i) => i + 1);

  return (
    <select
      defaultValue={count}
      disabled={pending}
      onChange={(e) => {
        const value = Number(e.target.value);
        startTransition(() => {
          setFeaturedPhotoCount(id, value);
        });
      }}
      className="border border-border bg-transparent px-2 py-1 font-mono text-xs text-foreground disabled:opacity-50"
    >
      {options.map((n) => (
        <option key={n} value={n} className="bg-background text-foreground">
          {n} foto{n > 1 ? "s" : ""}
        </option>
      ))}
    </select>
  );
}
