"use server";

import { signIn, signOut } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAppSchema, updateAppSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type CreateAppResult =
  | { success: true; url: string; slug: string }
  | { success: false; error: string };

export async function createApp(
  _prev: unknown,
  formData: FormData
): Promise<CreateAppResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to create an app" };
  }

  const raw = {
    slug: formData.get("slug")?.toString().trim().toLowerCase(),
    supabaseUrl: formData.get("supabaseUrl")?.toString().trim(),
  };

  const parsed = createAppSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.values(first).flat().find(Boolean) ?? "Invalid input";
    return { success: false, error: String(msg) };
  }

  const { slug, supabaseUrl } = parsed.data;

  try {
    await prisma.app.create({
      data: {
        slug,
        supabaseUrl,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
    const base = getBaseUrl();
    return {
      success: true,
      url: `${base}/${slug}`,
      slug,
    };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { success: false, error: `Slug "${slug}" is already taken` };
    }
    return { success: false, error: "Failed to create app. Please try again." };
  }
}

export async function getApps() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.app.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, supabaseUrl: true, createdAt: true },
  });
}

export async function updateApp(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<CreateAppResult | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const raw = {
    supabaseUrl: formData.get("supabaseUrl")?.toString().trim(),
  };

  const parsed = updateAppSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.values(first).flat().find(Boolean) ?? "Invalid input";
    return { success: false, error: String(msg) };
  }

  const existing = await prisma.app.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "App not found" };

  const updates: { supabaseUrl?: string } = {};
  if (parsed.data.supabaseUrl) updates.supabaseUrl = parsed.data.supabaseUrl;

  await prisma.app.update({ where: { id }, data: updates });
  revalidatePath("/");
  const base = getBaseUrl();
  return {
    success: true,
    url: `${base}/${existing.slug}`,
    slug: existing.slug,
  };
}

export async function deleteApp(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const existing = await prisma.app.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "App not found" };

  await prisma.app.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}
