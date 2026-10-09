"use client";

import { useActionState, useState, useTransition } from "react";

import type { FormState } from "@/app/admin/actions";
import { translateText } from "@/app/admin/actions";
import type { SiteContent } from "@/lib/site-content";

const inputClass =
  "w-full border-b border-border bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/60 focus:outline-none";
const labelClass = "mb-2 block font-mono text-xs tracking-widest text-muted-foreground";
const columnHeadingClass = "font-mono text-xs tracking-widest text-muted-foreground";

export function SiteContentForm({
  action,
  content,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  content: SiteContent;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [heroAbout, setHeroAbout] = useState(content.heroAbout);
  const [heroAboutEn, setHeroAboutEn] = useState(content.heroAboutEn);
  const [scrollHint, setScrollHint] = useState(content.scrollHint);
  const [scrollHintEn, setScrollHintEn] = useState(content.scrollHintEn);
  const [footerAbout, setFooterAbout] = useState(content.footerAbout);
  const [footerAboutEn, setFooterAboutEn] = useState(content.footerAboutEn);
  const [isTranslating, startTranslating] = useTransition();
  const [translateError, setTranslateError] = useState<string | null>(null);

  function handleTranslate() {
    setTranslateError(null);
    startTranslating(async () => {
      const [aboutResult, hintResult, footerResult] = await Promise.all([
        translateText(heroAbout),
        translateText(scrollHint),
        translateText(footerAbout),
      ]);
      const firstError = aboutResult.error ?? hintResult.error ?? footerResult.error;
      if (firstError) {
        setTranslateError(firstError);
        return;
      }
      if (aboutResult.translated !== undefined) setHeroAboutEn(aboutResult.translated);
      if (hintResult.translated !== undefined) setScrollHintEn(hintResult.translated);
      if (footerResult.translated !== undefined) setFooterAboutEn(footerResult.translated);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <div className="font-mono text-xs tracking-widest text-muted-foreground">Página inicial</div>
      <div className="grid grid-cols-2 gap-6 md:gap-10">
        <div className="flex flex-col gap-8 border-r border-border pr-6 md:pr-10">
          <div className={columnHeadingClass}>Português</div>

          <div>
            <label className={labelClass} htmlFor="heroAbout">
              Texto de apresentação (página inicial)
            </label>
            <textarea
              id="heroAbout"
              name="heroAbout"
              rows={5}
              required
              value={heroAbout}
              onChange={(e) => setHeroAbout(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="scrollHint">
              Tooltip de scroll
            </label>
            <input
              id="scrollHint"
              name="scrollHint"
              value={scrollHint}
              onChange={(e) => setScrollHint(e.target.value)}
              placeholder="Deslizar para mais"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="footerAbout">
              Texto de apresentação (rodapé)
            </label>
            <textarea
              id="footerAbout"
              name="footerAbout"
              rows={4}
              value={footerAbout}
              onChange={(e) => setFooterAbout(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-baseline justify-between gap-4">
            <div className={columnHeadingClass}>English</div>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {isTranslating ? "A traduzir..." : "Traduzir automaticamente"}
            </button>
          </div>

          <div>
            <label className={labelClass} htmlFor="heroAboutEn">
              Hero text (homepage)
            </label>
            <textarea
              id="heroAboutEn"
              name="heroAboutEn"
              rows={5}
              value={heroAboutEn}
              onChange={(e) => setHeroAboutEn(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="scrollHintEn">
              Scroll tooltip
            </label>
            <input
              id="scrollHintEn"
              name="scrollHintEn"
              value={scrollHintEn}
              onChange={(e) => setScrollHintEn(e.target.value)}
              placeholder="Keep Scrolling"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="footerAboutEn">
              Footer text
            </label>
            <textarea
              id="footerAboutEn"
              name="footerAboutEn"
              rows={4}
              value={footerAboutEn}
              onChange={(e) => setFooterAboutEn(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="mb-6 font-mono text-xs tracking-widest text-muted-foreground">
          Rodapé — contacto (também usado na página Contacto)
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="footerAddress1">
              Morada — linha 1
            </label>
            <input
              id="footerAddress1"
              name="footerAddress1"
              defaultValue={content.footerAddress1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerAddress2">
              Morada — linha 2
            </label>
            <input
              id="footerAddress2"
              name="footerAddress2"
              defaultValue={content.footerAddress2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerPhone">
              Telefone
            </label>
            <input
              id="footerPhone"
              name="footerPhone"
              defaultValue={content.footerPhone}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerEmail">
              E-mail
            </label>
            <input
              id="footerEmail"
              name="footerEmail"
              defaultValue={content.footerEmail}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerInstagramUrl">
              Instagram (URL)
            </label>
            <input
              id="footerInstagramUrl"
              name="footerInstagramUrl"
              defaultValue={content.footerInstagramUrl}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerMapsUrl">
              Google Maps (URL)
            </label>
            <input
              id="footerMapsUrl"
              name="footerMapsUrl"
              defaultValue={content.footerMapsUrl}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="footerCopyright">
              Direitos de autor
            </label>
            <input
              id="footerCopyright"
              name="footerCopyright"
              defaultValue={content.footerCopyright}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="mb-6 font-mono text-xs tracking-widest text-muted-foreground">
          Página Sobre
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-6 md:border-r md:border-border md:pr-10">
            <div>
              <label className={labelClass} htmlFor="navAboutLabel">
                Nome da aba de navegação
              </label>
              <input
                id="navAboutLabel"
                name="navAboutLabel"
                defaultValue={content.navAboutLabel}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreHeading">
                Título
              </label>
              <input
                id="sobreHeading"
                name="sobreHeading"
                defaultValue={content.sobreHeading}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreBody">
                Texto (parágrafos separados por linha em branco)
              </label>
              <textarea
                id="sobreBody"
                name="sobreBody"
                rows={10}
                defaultValue={content.sobreBody}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreFacts">
                Números em destaque — um por linha, formato &quot;valor | legenda&quot;
              </label>
              <textarea
                id="sobreFacts"
                name="sobreFacts"
                rows={4}
                defaultValue={content.sobreFacts.map((f) => `${f.value} | ${f.label}`).join("\n")}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClass} htmlFor="navAboutLabelEn">
                Nav tab name (EN)
              </label>
              <input
                id="navAboutLabelEn"
                name="navAboutLabelEn"
                defaultValue={content.navAboutLabelEn}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreHeadingEn">
                Title (EN)
              </label>
              <input
                id="sobreHeadingEn"
                name="sobreHeadingEn"
                defaultValue={content.sobreHeadingEn}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreBodyEn">
                Text (EN) — paragraphs separated by a blank line
              </label>
              <textarea
                id="sobreBodyEn"
                name="sobreBodyEn"
                rows={10}
                defaultValue={content.sobreBodyEn}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sobreFactsEn">
                Highlighted numbers (EN) — one per line, &quot;value | label&quot;
              </label>
              <textarea
                id="sobreFactsEn"
                name="sobreFactsEn"
                rows={4}
                defaultValue={content.sobreFactsEn.map((f) => `${f.value} | ${f.label}`).join("\n")}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="mb-6 font-mono text-xs tracking-widest text-muted-foreground">
          Página Equipa
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-6 md:border-r md:border-border md:pr-10">
            <div>
              <label className={labelClass} htmlFor="equipaHeading">
                Título
              </label>
              <input
                id="equipaHeading"
                name="equipaHeading"
                defaultValue={content.equipaHeading}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="equipaIntro">
                Texto de introdução
              </label>
              <input
                id="equipaIntro"
                name="equipaIntro"
                defaultValue={content.equipaIntro}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClass} htmlFor="equipaHeadingEn">
                Title (EN)
              </label>
              <input
                id="equipaHeadingEn"
                name="equipaHeadingEn"
                defaultValue={content.equipaHeadingEn}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="equipaIntroEn">
                Intro text (EN)
              </label>
              <input
                id="equipaIntroEn"
                name="equipaIntroEn"
                defaultValue={content.equipaIntroEn}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="mb-6 font-mono text-xs tracking-widest text-muted-foreground">
          Página Contacto
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-6 md:border-r md:border-border md:pr-10">
            <div>
              <label className={labelClass} htmlFor="contactoHeading">
                Título
              </label>
              <input
                id="contactoHeading"
                name="contactoHeading"
                defaultValue={content.contactoHeading}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactReasons">
                Razões de contacto — uma por linha
              </label>
              <textarea
                id="contactReasons"
                name="contactReasons"
                rows={8}
                defaultValue={content.contactReasons.join("\n")}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <label className={labelClass} htmlFor="contactoHeadingEn">
                Title (EN)
              </label>
              <input
                id="contactoHeadingEn"
                name="contactoHeadingEn"
                defaultValue={content.contactoHeadingEn}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactReasonsEn">
                Contact reasons (EN) — one per line
              </label>
              <textarea
                id="contactReasonsEn"
                name="contactReasonsEn"
                rows={8}
                defaultValue={content.contactReasonsEn.join("\n")}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {translateError ? <p className="text-sm text-red-400">{translateError}</p> : null}
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-border px-6 py-3 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40 disabled:opacity-50"
        >
          {pending ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
