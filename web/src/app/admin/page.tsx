import Image from "next/image";
import Link from "next/link";

import { logout } from "@/app/admin/login/actions";
import { moveFeatured, toggleFeatured } from "@/app/admin/actions";
import { AllProjectsList } from "@/components/admin/all-projects-list";
import { PhotoCountSelect } from "@/components/admin/photo-count-select";
import { getProjects } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const projects = await getProjects();
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const rest = projects.filter((p) => !p.featured);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-widest text-muted-foreground">Admin</p>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Projetos</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/projetos/novo"
            className="rounded-full border border-border px-5 py-2.5 font-mono text-xs tracking-widest text-foreground transition-colors hover:border-foreground/40"
          >
            + Novo projeto
          </Link>
          <Link
            href="/admin/conteudo"
            className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
          >
            Textos do site
          </Link>
          <Link
            href="/admin/equipa"
            className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
          >
            Equipa
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      <section className="mb-16">
        <div className="mb-6 flex items-baseline justify-between border-b border-border pb-4">
          <p className="font-mono text-xs tracking-widest text-muted-foreground">
            Destaque na página inicial
          </p>
          <span className="font-mono text-xs text-muted-foreground">{featured.length}</span>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum projeto em destaque.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {featured.map((project, i) => (
              <div
                key={project.id}
                className="flex items-center gap-4 border border-border p-3"
              >
                <span className="w-6 font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-secondary">
                  <Image
                    src={project.images[0]}
                    alt={project.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {project.name}
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">
                    {[project.category, project.location].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <PhotoCountSelect
                  id={project.id}
                  count={project.featuredPhotoCount}
                  max={project.images.length}
                />
                <div className="flex items-center gap-3">
                  <form action={moveFeatured.bind(null, project.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveFeatured.bind(null, project.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === featured.length - 1}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <Link
                    href={`/admin/projetos/${project.id}`}
                    className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    Editar
                  </Link>
                  <form action={toggleFeatured.bind(null, project.id, false)}>
                    <button
                      type="submit"
                      className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <AllProjectsList projects={rest} />
      </section>
    </main>
  );
}
