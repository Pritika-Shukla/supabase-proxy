"use server";

import { signIn, signOut } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProxyUrl } from "@/lib/subdomain";
import { revalidatePath } from "next/cache";

const CUSTOM_NAME_RE = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$/;
const PROJECT_ID_RE = /^[a-z][a-z0-9]{2,62}$/;

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type CreateProxyResult =
  | { success: true; url: string; customName: string }
  | { success: false; error: string };

export async function createProxy(
  _prev: unknown,
  formData: FormData
): Promise<CreateProxyResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to create a proxy" };
  }

  const projectId = formData.get("projectId")?.toString().trim().toLowerCase();
  const customName = formData.get("customName")?.toString().trim().toLowerCase();

  if (!projectId || !customName) {
    return { success: false, error: "Project ID and custom name are required" };
  }

  if (!PROJECT_ID_RE.test(projectId)) {
    return {
      success: false,
      error: "Project ID must be lowercase alphanumeric (3–63 chars)",
    };
  }

  if (!CUSTOM_NAME_RE.test(customName)) {
    return {
      success: false,
      error:
        "Custom name must be 3–62 chars, lowercase alphanumeric with hyphens",
    };
  }

  try {
    await prisma.proxy.create({
      data: {
        customName,
        projectId,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
    return {
      success: true,
      url: getProxyUrl(customName),
      customName,
    };
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      return { success: false, error: `Custom name "${customName}" is already taken` };
    }
    return { success: false, error: "Failed to create proxy. Please try again." };
  }
}

export async function getProxies() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.proxy.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { customName: true, projectId: true, createdAt: true },
  });
}