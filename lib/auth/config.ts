import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db/client";
import {
  authAccounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { GOOGLE_CALENDAR_SCOPES } from "@/lib/google/oauth";

export function buildAuthConfig(): NextAuthConfig {
  return {
    adapter: DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: authAccounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
      authenticatorsTable: authenticators,
    }),
    trustHost: true,
    secret: config.nextAuthSecret,
    session: {
      strategy: "database",
    },
    providers: [
      Google({
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        authorization: {
          params: {
            scope: GOOGLE_CALENDAR_SCOPES.join(" "),
            access_type: "offline",
            prompt: "consent select_account",
          },
        },
      }),
    ],
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth(() => buildAuthConfig());
