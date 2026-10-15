import Link from "next/link";

import { createProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/admin"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Admin
      </Link>
      <h1 className="mb-10 text-3xl font-medium tracking-tight text-foreground">
        Novo projeto
      </h1>
      <ProjectForm action={createProject} submitLabel="Criar projeto" />
    </main>
  );
}
