import { z } from "zod";

export const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

export const createAppSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(SLUG_REGEX, "Slug: 3-50 chars, lowercase alphanumeric and hyphens only"),
  supabaseUrl: z
    .string()
    .url()
    .refine(
      (url) => /^https:\/\/[a-zA-Z0-9.-]+\.supabase\.co\/?$/.test(url),
      "Must be https://xxx.supabase.co"
    )
    .transform((url) => url.replace(/\/$/, "")),
});

export const updateAppSchema = createAppSchema.partial().omit({ slug: true });
