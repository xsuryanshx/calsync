import { google, type calendar_v3 } from "googleapis";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

export class ReauthRequired extends Error {
  constructor(public accountId: number, message = "reauth required") {
    super(message);
    this.name = "ReauthRequired";
  }
}

export class SyncFailed extends Error {
  constructor(public reason: string) {
    super(reason);
    this.name = "SyncFailed";
  }
}

export type ClientCredentials = {
  accountId: number;
  refreshToken: string;
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
};

export type ListEventsArgs = {
  timeMin: Date;
  timeMax: Date;
  calendarId?: string;
};

export class GoogleCalendarClient {
  constructor(private creds: ClientCredentials) {}

  private buildAuth() {
    const oauth2 = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
    );
    oauth2.setCredentials({
      refresh_token: this.creds.refreshToken,
      access_token: this.creds.accessToken ?? undefined,
      expiry_date: this.creds.accessTokenExpiresAt?.getTime(),
    });
    return oauth2;
  }

  async listEvents(args: ListEventsArgs): Promise<calendar_v3.Schema$Event[]> {
    const auth = this.buildAuth();

    try {
      await auth.getAccessToken();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      if (
        e?.response?.data?.error === "invalid_grant" ||
        /invalid_grant/.test(e?.message ?? "")
      ) {
        throw new ReauthRequired(this.creds.accountId);
      }
      throw new SyncFailed(`token refresh failed: ${e?.message ?? String(err)}`);
    }

    const calendar = google.calendar({ version: "v3", auth });

    const attempt = async (n: number): Promise<calendar_v3.Schema$Event[]> => {
      try {
        const res = await calendar.events.list({
          calendarId: args.calendarId ?? "primary",
          timeMin: args.timeMin.toISOString(),
          timeMax: args.timeMax.toISOString(),
          singleEvents: true,
          showDeleted: false,
          maxResults: 2500,
          orderBy: "startTime",
        });
        return res.data.items ?? [];
      } catch (err) {
        const e = err as {
          code?: number;
          response?: { status?: number; data?: { error?: string } };
          message?: string;
        };
        const code = e?.code ?? e?.response?.status ?? 0;
        if ((code === 429 || (code >= 500 && code < 600)) && n < 3) {
          const delay = 1000 * 2 ** n;
          logger.warn(
            { accountId: this.creds.accountId, code, n, delay },
            "google api retry",
          );
          await new Promise((r) => setTimeout(r, delay));
          return attempt(n + 1);
        }
        if (e?.response?.data?.error === "invalid_grant") {
          throw new ReauthRequired(this.creds.accountId);
        }
        throw new SyncFailed(`events.list failed: ${e?.message ?? String(err)}`);
      }
    };

    return attempt(0);
  }
}
