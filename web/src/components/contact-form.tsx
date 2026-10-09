"use client";

import { useState, type FormEvent } from "react";

import type { Locale } from "@/lib/i18n";

const inputClass =
  "w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/60 focus:outline-none";
const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";

const COPY = {
  pt: {
    name: "Nome",
    email: "E-mail",
    country: "País",
    city: "Cidade",
    company: "Empresa",
    reason: "Razão de Contacto",
    message: "Como podemos ajudar?",
    submit: "Enviar",
    hint: "Abre o seu cliente de email com a mensagem pré-preenchida.",
    subjectPrefix: "Contacto via operastudio.net",
    fields: { name: "Nome", email: "E-mail", country: "País", city: "Cidade", company: "Empresa", reason: "Razão de Contacto" },
  },
  en: {
    name: "Name",
    email: "Email",
    country: "Country",
    city: "City",
    company: "Company",
    reason: "Reason for Contact",
    message: "How can we help?",
    submit: "Send",
    hint: "Opens your email client with the message pre-filled.",
    subjectPrefix: "Contact via operastudio.net",
    fields: { name: "Name", email: "Email", country: "Country", city: "City", company: "Company", reason: "Reason for Contact" },
  },
} as const;

export function ContactForm({ reasons, locale = "pt" }: { reasons: string[]; locale?: Locale }) {
  const copy = COPY[locale];
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    company: "",
    reason: reasons[0] ?? "",
    message: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[${form.reason}] ${copy.subjectPrefix}`);
    const bodyLines = [
      `${copy.fields.name}: ${form.name}`,
      `${copy.fields.email}: ${form.email}`,
      `${copy.fields.country}: ${form.country}`,
      `${copy.fields.city}: ${form.city}`,
      `${copy.fields.company}: ${form.company}`,
      `${copy.fields.reason}: ${form.reason}`,
      "",
      form.message,
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:info@operastudio.net?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="name">
          {copy.name}
        </label>
        <input
          id="name"
          required
          className={inputClass}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">
          {copy.email}
        </label>
        <input
          id="email"
          type="email"
          required
          className={inputClass}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="country">
          {copy.country}
        </label>
        <input
          id="country"
          className={inputClass}
          value={form.country}
          onChange={(e) => update("country", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="city">
          {copy.city}
        </label>
        <input
          id="city"
          className={inputClass}
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="company">
          {copy.company}
        </label>
        <input
          id="company"
          className={inputClass}
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="reason">
          {copy.reason}
        </label>
        <select
          id="reason"
          className={inputClass}
          value={form.reason}
          onChange={(e) => update("reason", e.target.value)}
        >
          {reasons.map((r) => (
            <option key={r} value={r} className="bg-background text-foreground">
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="message">
          {copy.message}
        </label>
        <textarea
          id="message"
          required
          rows={5}
          className={inputClass}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full border border-border px-6 py-3 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40"
        >
          {copy.submit}
        </button>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">{copy.hint}</p>
      </div>
    </form>
  );
}
