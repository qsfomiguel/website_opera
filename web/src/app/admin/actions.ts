"use server";

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getProjects,
  saveProject,
  deleteProjectRow,
  uniqueId,
  nextProjectSortOrder,
  moveProject,
} from "@/lib/content-store";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";
import {
  getTeam,
  saveTeamMember,
  deleteTeamMemberRow,
  uniqueTeamId,
  nextTeamSortOrder,
  moveTeamMember,
} from "@/lib/team-store";

export type FormState = { error?: string };

const execFileAsync = promisify(execFile);
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

async function saveUploadedImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(`uploads/${filename}`, buffer, { access: "public" });
  return blob.url;
}

async function processLogoImage(file: File): Promise<{ dark: string; light: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "logo-"));
  const buffer = Buffer.from(await file.arrayBuffer());
  const srcPath = path.join(tmpDir, "src");

  const id = crypto.randomUUID();
  const darkPath = path.join(tmpDir, `${id}-dark.png`);
  const lightPath = path.join(tmpDir, `${id}-light.png`);

  try {
    await fs.writeFile(srcPath, buffer);
    await execFileAsync("python3", [
      path.join(SCRIPTS_DIR, "process-logo.py"),
      srcPath,
      darkPath,
      lightPath,
    ]);
    const [darkBlob, lightBlob] = await Promise.all([
      put(`uploads/${id}-dark.png`, await fs.readFile(darkPath), { access: "public" }),
      put(`uploads/${id}-light.png`, await fs.readFile(lightPath), { access: "public" }),
    ]);
    return { dark: darkBlob.url, light: lightBlob.url };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function saveUploadedImages(files: File[]): Promise<string[]> {
  const paths: string[] = [];
  for (const file of files) {
    if (file.size > 0) {
      paths.push(await saveUploadedImage(file));
    }
  }
  return paths;
}

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath("/sobre");
  revalidatePath("/equipa");
  revalidatePath("/contacto");
  revalidatePath("/admin");
}

export async function toggleFeatured(id: string, featured: boolean) {
  const projects = await getProjects();
  const target = projects.find((p) => p.id === id);
  if (!target) return;

  if (featured) {
    const maxOrder = Math.max(
      0,
      ...projects.filter((p) => p.featured).map((p) => p.featuredOrder ?? 0),
    );
    target.featured = true;
    target.featuredOrder = maxOrder + 1;
    if (!target.featuredPhotoCount) {
      target.featuredPhotoCount = Math.min(2, target.images.length || 1);
    }
    await saveProject(target);
  } else {
    target.featured = false;
    target.featuredOrder = null;
    await saveProject(target);
    const remaining = projects
      .filter((p) => p.featured && p.id !== id)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    await Promise.all(
      remaining.map((p, i) => saveProject({ ...p, featuredOrder: i + 1 })),
    );
  }

  revalidatePublicPages();
}

export async function moveFeatured(id: string, direction: "up" | "down") {
  const projects = await getProjects();
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const idx = featured.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= featured.length) return;

  const a = featured[idx];
  const b = featured[swapWith];
  const tmp = a.featuredOrder;
  a.featuredOrder = b.featuredOrder;
  b.featuredOrder = tmp;

  await Promise.all([saveProject(a), saveProject(b)]);
  revalidatePublicPages();
}

export async function moveProjectOrder(id: string, direction: "up" | "down") {
  await moveProject(id, direction);
  revalidatePublicPages();
  revalidatePath("/admin");
}

export async function setFeaturedPhotoCount(id: string, count: number) {
  const projects = await getProjects();
  const target = projects.find((p) => p.id === id);
  if (!target) return;
  const max = Math.max(1, target.images.length);
  target.featuredPhotoCount = Math.min(Math.max(1, count), max, 3);
  await saveProject(target);
  revalidatePublicPages();
}

export async function updateProject(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const projects = await getProjects();
  const target = projects.find((p) => p.id === id);
  if (!target) {
    return { error: "Projeto não encontrado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "O nome é obrigatório." };
  }

  target.name = name;
  target.nameEn = String(formData.get("nameEn") ?? "").trim();
  target.location = String(formData.get("location") ?? "").trim();
  target.category = String(formData.get("category") ?? "").trim();
  target.description = String(formData.get("description") ?? "").trim();
  target.descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  target.clientName = String(formData.get("clientName") ?? "").trim();
  target.year = String(formData.get("year") ?? "").trim();
  target.area = String(formData.get("area") ?? "").trim();
  target.budgetEstimate = String(formData.get("budgetEstimate") ?? "").trim();

  const removeImages = new Set(formData.getAll("removeImage").map(String));
  const keptImages = target.images.filter((img) => !removeImages.has(img));

  const newFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const newImagePaths = await saveUploadedImages(newFiles);

  const images = [...keptImages, ...newImagePaths];
  if (images.length === 0) {
    return { error: "O projeto precisa de pelo menos uma imagem." };
  }
  target.images = images;

  const requestedCount = Number(formData.get("featuredPhotoCount") ?? target.featuredPhotoCount ?? 1);
  target.featuredPhotoCount = Math.min(Math.max(1, requestedCount || 1), images.length, 3);

  await saveProject(target);
  revalidatePublicPages();
  redirect("/admin");
}

export async function createProject(_prevState: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const budgetEstimate = String(formData.get("budgetEstimate") ?? "").trim();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name) {
    return { error: "O nome é obrigatório." };
  }
  if (files.length === 0) {
    return { error: "É necessário escolher pelo menos uma imagem." };
  }

  const images = await saveUploadedImages(files);
  const id = await uniqueId(name, location);
  const requestedCount = Number(formData.get("featuredPhotoCount") ?? 1);
  const sortOrder = await nextProjectSortOrder();

  await saveProject({
    id,
    name,
    nameEn,
    location,
    category,
    description,
    descriptionEn,
    images,
    featured: false,
    featuredOrder: null,
    featuredPhotoCount: Math.min(Math.max(1, requestedCount || 1), images.length, 3),
    clientName,
    year,
    area,
    budgetEstimate,
    sortOrder,
  });
  revalidatePublicPages();
  redirect("/admin");
}

export async function updateSiteContent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const heroAbout = String(formData.get("heroAbout") ?? "").trim();
  const heroAboutEn = String(formData.get("heroAboutEn") ?? "").trim();
  const scrollHint = String(formData.get("scrollHint") ?? "").trim();
  const scrollHintEn = String(formData.get("scrollHintEn") ?? "").trim();
  const footerAbout = String(formData.get("footerAbout") ?? "").trim();
  const footerAboutEn = String(formData.get("footerAboutEn") ?? "").trim();
  const footerAddress1 = String(formData.get("footerAddress1") ?? "").trim();
  const footerAddress2 = String(formData.get("footerAddress2") ?? "").trim();
  const footerPhone = String(formData.get("footerPhone") ?? "").trim();
  const footerEmail = String(formData.get("footerEmail") ?? "").trim();
  const footerInstagramUrl = String(formData.get("footerInstagramUrl") ?? "").trim();
  const footerMapsUrl = String(formData.get("footerMapsUrl") ?? "").trim();
  const footerCopyright = String(formData.get("footerCopyright") ?? "").trim();
  const contactReasons = String(formData.get("contactReasons") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const navAboutLabel = String(formData.get("navAboutLabel") ?? "").trim();
  const navAboutLabelEn = String(formData.get("navAboutLabelEn") ?? "").trim();
  const sobreHeading = String(formData.get("sobreHeading") ?? "").trim();
  const sobreBody = String(formData.get("sobreBody") ?? "").trim();
  const sobreFacts = String(formData.get("sobreFacts") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label] = line.split("|").map((part) => part.trim());
      return { value: value ?? "", label: label ?? "" };
    });
  const equipaHeading = String(formData.get("equipaHeading") ?? "").trim();
  const equipaIntro = String(formData.get("equipaIntro") ?? "").trim();
  const contactoHeading = String(formData.get("contactoHeading") ?? "").trim();
  const sobreHeadingEn = String(formData.get("sobreHeadingEn") ?? "").trim();
  const sobreBodyEn = String(formData.get("sobreBodyEn") ?? "").trim();
  const sobreFactsEn = String(formData.get("sobreFactsEn") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label] = line.split("|").map((part) => part.trim());
      return { value: value ?? "", label: label ?? "" };
    });
  const equipaHeadingEn = String(formData.get("equipaHeadingEn") ?? "").trim();
  const equipaIntroEn = String(formData.get("equipaIntroEn") ?? "").trim();
  const contactoHeadingEn = String(formData.get("contactoHeadingEn") ?? "").trim();
  const contactReasonsEn = String(formData.get("contactReasonsEn") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!heroAbout) {
    return { error: "O texto de apresentação é obrigatório." };
  }

  const current = await getSiteContent();
  await saveSiteContent({
    ...current,
    heroAbout,
    heroAboutEn,
    scrollHint,
    scrollHintEn,
    footerAbout,
    footerAboutEn,
    footerAddress1,
    footerAddress2,
    footerPhone,
    footerEmail,
    footerInstagramUrl,
    footerMapsUrl,
    footerCopyright,
    contactReasons: contactReasons.length > 0 ? contactReasons : current.contactReasons,
    navAboutLabel: navAboutLabel || current.navAboutLabel,
    navAboutLabelEn: navAboutLabelEn || current.navAboutLabelEn,
    sobreHeading: sobreHeading || current.sobreHeading,
    sobreHeadingEn: sobreHeadingEn || current.sobreHeadingEn,
    sobreBody: sobreBody || current.sobreBody,
    sobreBodyEn: sobreBodyEn || current.sobreBodyEn,
    sobreFacts: sobreFacts.length > 0 ? sobreFacts : current.sobreFacts,
    sobreFactsEn: sobreFactsEn.length > 0 ? sobreFactsEn : current.sobreFactsEn,
    equipaHeading: equipaHeading || current.equipaHeading,
    equipaHeadingEn: equipaHeadingEn || current.equipaHeadingEn,
    equipaIntro: equipaIntro || current.equipaIntro,
    equipaIntroEn: equipaIntroEn || current.equipaIntroEn,
    contactoHeading: contactoHeading || current.contactoHeading,
    contactoHeadingEn: contactoHeadingEn || current.contactoHeadingEn,
    contactReasonsEn: contactReasonsEn.length > 0 ? contactReasonsEn : current.contactReasonsEn,
  });
  revalidatePublicPages();
  redirect("/admin");
}

export async function uploadLogo(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha um ficheiro de imagem." };
  }

  let urls: { dark: string; light: string };
  try {
    urls = await processLogoImage(file);
  } catch {
    return { error: "Não foi possível processar o logotipo. Tente outra imagem." };
  }

  const current = await getSiteContent();
  await saveSiteContent({ ...current, logoUrl: urls.dark, logoUrlLight: urls.light });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
  return {};
}

export async function removeLogo(): Promise<void> {
  const current = await getSiteContent();
  await saveSiteContent({ ...current, logoUrl: "", logoUrlLight: "" });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
}

export async function uploadAboutPhoto(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Escolha um ficheiro de imagem." };
  }

  const url = await saveUploadedImage(file);
  const current = await getSiteContent();
  await saveSiteContent({ ...current, aboutPhotoUrl: url });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
  return {};
}

export async function removeAboutPhoto(): Promise<void> {
  const current = await getSiteContent();
  await saveSiteContent({ ...current, aboutPhotoUrl: "" });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
}

export async function addAwardImages(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "Escolha pelo menos um ficheiro de imagem." };
  }

  const newImages = await saveUploadedImages(files);
  const current = await getSiteContent();
  await saveSiteContent({ ...current, awardImages: [...current.awardImages, ...newImages] });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
  return {};
}

export async function removeAwardImage(url: string): Promise<void> {
  const current = await getSiteContent();
  await saveSiteContent({
    ...current,
    awardImages: current.awardImages.filter((img) => img !== url),
  });
  revalidatePublicPages();
  revalidatePath("/admin/conteudo");
}

export async function translateText(text: string): Promise<{ translated?: string; error?: string }> {
  const trimmed = text.trim();
  if (!trimmed) return { translated: "" };

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as [Array<[string, string]>];
    const translated = data[0].map((chunk) => chunk[0]).join("");
    return { translated };
  } catch {
    return { error: "Não foi possível traduzir automaticamente. Edite o texto em inglês manualmente." };
  }
}

export async function deleteProject(id: string) {
  await deleteProjectRow(id);
  revalidatePublicPages();
  redirect("/admin");
}

export async function createTeamMember(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const roleEn = String(formData.get("roleEn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const file = formData.get("photo");

  if (!name) {
    return { error: "O nome é obrigatório." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: "É necessário escolher uma fotografia." };
  }

  const photo = await saveUploadedImage(file);
  const id = await uniqueTeamId(name);
  const sortOrder = await nextTeamSortOrder();

  await saveTeamMember({ id, name, role, roleEn, photo, description, descriptionEn, sortOrder });
  revalidatePublicPages();
  redirect("/admin/equipa");
}

export async function updateTeamMember(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const team = await getTeam();
  const target = team.find((m) => m.id === id);
  if (!target) {
    return { error: "Membro não encontrado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "O nome é obrigatório." };
  }

  target.name = name;
  target.role = String(formData.get("role") ?? "").trim();
  target.roleEn = String(formData.get("roleEn") ?? "").trim();
  target.description = String(formData.get("description") ?? "").trim();
  target.descriptionEn = String(formData.get("descriptionEn") ?? "").trim();

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    target.photo = await saveUploadedImage(file);
  }

  await saveTeamMember(target);
  revalidatePublicPages();
  redirect("/admin/equipa");
}

export async function deleteTeamMember(id: string) {
  await deleteTeamMemberRow(id);
  revalidatePublicPages();
  redirect("/admin/equipa");
}

export async function moveTeamMemberOrder(id: string, direction: "up" | "down") {
  await moveTeamMember(id, direction);
  revalidatePublicPages();
  revalidatePath("/admin/equipa");
}
