import { z } from "zod";

const ConfigSchema = z.object({
  jwt: z.string().min(1, "SNAPPFOOD_JWT is required"),
  baseUrl: z.string().url().default("https://snappfood.ir"),
  debug: z.boolean().default(false)
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  return ConfigSchema.parse({
    jwt: env.SNAPPFOOD_JWT,
    baseUrl: env.SNAPPFOOD_BASE_URL ?? "https://snappfood.ir",
    debug: env.DEBUG?.split(",").some((value) => value.trim() === "snappfood-mcp") ?? false
  });
}
