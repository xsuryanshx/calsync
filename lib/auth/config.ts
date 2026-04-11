import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { config } from "@/lib/config";
import { upsertAccount } from "@/lib/db/token-store";
import { logger } from "@/lib/logger";

export const authConfig: NextAuthConfig = {
  secret: config.nextAuthSecret,
  providers: [
    Google({
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      authorization: {
        params: {
          scope: "openid email https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || account.provider !== "google") return false;
      const email = (profile as { email?: string } | undefined)?.email;
      if (!email) {
        logger.error("google profile has no email");
        return false;
      }
      if (!account.refresh_token) {
        logger.error({ email }, "no refresh_token returned — ensure prompt=consent");
        return false;
      }
      try {
        await upsertAccount({
          userId: 1,
          googleEmail: email,
          refreshToken: account.refresh_token,
          accessToken: account.access_token ?? null,
          accessTokenExpiresAt: account.expires_at
            ? new Date(account.expires_at * 1000)
            : null,
        });
      } catch (err) {
        logger.error({ err: String(err) }, "failed to persist account");
        return false;
      }
      return "/settings?connected=1";
    },
  },
  pages: {
    error: "/settings?error=1",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
