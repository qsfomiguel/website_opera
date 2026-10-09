import type { Metadata } from "next";

import { ProjectPage } from "@/app/projetos/[id]/page";
import { getProject } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};
  return {
    title: `${project.nameEn || project.name} — Opera Studio`,
    description:
      project.descriptionEn || project.description || [project.category, project.location].filter(Boolean).join(" · "),
  };
}

export default function EnProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectPage params={params} locale="en" />;
}
