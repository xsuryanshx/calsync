import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listAccountsForUser,
  getGoogleLoginAccountForUser,
  upsertAccount,
  clearGoogleLoginTokensForUser,
  syncUserCalendars,
  withUserSyncLock,
} = vi.hoisted(() => ({
  listAccountsForUser: vi.fn(),
  getGoogleLoginAccountForUser: vi.fn(),
  upsertAccount: vi.fn(),
  clearGoogleLoginTokensForUser: vi.fn(),
  syncUserCalendars: vi.fn(),
  withUserSyncLock: vi.fn(),
}));

vi.mock("@/lib/db/token-store", () => ({
  listAccountsForUser,
  upsertAccount,
}));

vi.mock("@/lib/db/auth-store", () => ({
  getGoogleLoginAccountForUser,
  clearGoogleLoginTokensForUser,
}));

vi.mock("@/lib/sync/sync-user", () => ({
  syncUserCalendars,
}));

vi.mock("@/lib/sync/sync-guard", () => ({
  withUserSyncLock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { ensurePrimaryCalendarConnectionForUser } from "@/lib/auth/onboarding";

describe("ensurePrimaryCalendarConnectionForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withUserSyncLock.mockImplementation(async (_userId, fn) => fn());
  });

  it("does nothing when the user already has linked calendars", async () => {
    listAccountsForUser.mockResolvedValue([{ id: "existing-1" }]);

    await ensurePrimaryCalendarConnectionForUser("user-1");

    expect(getGoogleLoginAccountForUser).not.toHaveBeenCalled();
    expect(upsertAccount).not.toHaveBeenCalled();
  });

  it("copies the login account into a calendar connection and syncs it", async () => {
    listAccountsForUser.mockResolvedValue([]);
    getGoogleLoginAccountForUser.mockResolvedValue({
      providerAccountId: "google-sub-1",
      userEmail: "user@example.com",
      refreshToken: "refresh-token",
      accessToken: "access-token",
      expiresAt: new Date("2026-04-11T01:00:00.000Z"),
    });
    upsertAccount.mockResolvedValue({ id: "calendar-connection-1" });

    await ensurePrimaryCalendarConnectionForUser("user-1");

    expect(upsertAccount).toHaveBeenCalledWith({
      userId: "user-1",
      googleSub: "google-sub-1",
      googleEmail: "user@example.com",
      refreshToken: "refresh-token",
      accessToken: "access-token",
      accessTokenExpiresAt: new Date("2026-04-11T01:00:00.000Z"),
      status: "active",
    });
    expect(clearGoogleLoginTokensForUser).toHaveBeenCalledWith(
      "user-1",
      "google-sub-1",
    );
    expect(syncUserCalendars).toHaveBeenCalledWith("user-1", {
      accountIds: ["calendar-connection-1"],
    });
  });
});
