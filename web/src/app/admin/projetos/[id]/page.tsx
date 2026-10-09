import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/project-form";
import { getProject } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/admin"
        className="mb-10 inline-block font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← Admin
      </Link>
      <h1 className="mb-10 text-3xl font-medium tracking-tight text-foreground">
        {project.name}
      </h1>
      <ProjectForm action={updateProject.bind(null, id)} project={project} submitLabel="Guardar" />
    </main>
  );
}
