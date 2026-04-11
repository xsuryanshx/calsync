import { z } from "zod";

function isPostgresUrl(value: string): boolean {
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}

const schema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().refine(
    (v) => {
      try {
        return Buffer.from(v, "base64").length === 32;
      } catch {
        return false;
      }
    },
    {
      message:
        "ENCRYPTION_KEY must be base64-encoded 32 bytes (openssl rand -base64 32)",
    },
  ),
  DATABASE_URL: z.string().refine(isPostgresUrl, {
    message:
      "DATABASE_URL must be a postgres connection string for this multi-user build",
  }),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

export type Config = {
  googleClientId: string;
  googleClientSecret: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
  googleLinkRedirectUrl: string;
  encryptionKey: Buffer;
  databaseUrl: string;
  upstashRedisRestUrl?: string;
  upstashRedisRestToken?: string;
  redisEnabled: boolean;
  isProduction: boolean;
};

export function loadConfig(): Config {
  const parsed = schema.parse(process.env);

  return {
    googleClientId: parsed.GOOGLE_CLIENT_ID,
    googleClientSecret: parsed.GOOGLE_CLIENT_SECRET,
    nextAuthSecret: parsed.NEXTAUTH_SECRET,
    nextAuthUrl: parsed.NEXTAUTH_URL,
    googleLinkRedirectUrl: new URL(
      "/api/google/callback",
      parsed.NEXTAUTH_URL,
    ).toString(),
    encryptionKey: Buffer.from(parsed.ENCRYPTION_KEY, "base64"),
    databaseUrl: parsed.DATABASE_URL,
    upstashRedisRestUrl: parsed.UPSTASH_REDIS_REST_URL,
    upstashRedisRestToken: parsed.UPSTASH_REDIS_REST_TOKEN,
    redisEnabled: Boolean(
      parsed.UPSTASH_REDIS_REST_URL && parsed.UPSTASH_REDIS_REST_TOKEN,
    ),
    isProduction: process.env.NODE_ENV === "production",
  };
}

export const config: Config = new Proxy({} as Config, {
  get(_, prop) {
    const cfg = loadConfig();
    return Reflect.get(cfg, prop);
  },
});
