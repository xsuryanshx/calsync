import { z } from "zod";

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
    { message: "ENCRYPTION_KEY must be base64-encoded 32 bytes (openssl rand -base64 32)" },
  ),
  DATABASE_URL: z.string().min(1),
});

export type Config = {
  googleClientId: string;
  googleClientSecret: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
  encryptionKey: Buffer;
  databaseUrl: string;
};

export function loadConfig(): Config {
  const parsed = schema.parse(process.env);
  return {
    googleClientId: parsed.GOOGLE_CLIENT_ID,
    googleClientSecret: parsed.GOOGLE_CLIENT_SECRET,
    nextAuthSecret: parsed.NEXTAUTH_SECRET,
    nextAuthUrl: parsed.NEXTAUTH_URL,
    encryptionKey: Buffer.from(parsed.ENCRYPTION_KEY, "base64"),
    databaseUrl: parsed.DATABASE_URL,
  };
}

export const config: Config = new Proxy({} as Config, {
  get(_, prop) {
    const cfg = loadConfig();
    return Reflect.get(cfg, prop);
  },
});
