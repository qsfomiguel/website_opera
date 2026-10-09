"use client";

import { useActionState } from "react";

import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <form action={formAction} className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-medium tracking-tight text-foreground">Admin</h1>
        <label
          className="mb-2 block font-mono text-xs tracking-widest text-muted-foreground"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground focus:border-foreground/60 focus:outline-none"
        />
        {state.error ? <p className="mt-3 text-sm text-red-400">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-8 rounded-full border border-border px-6 py-3 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50"
        >
          {pending ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
