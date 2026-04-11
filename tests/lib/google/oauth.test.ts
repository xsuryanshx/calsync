import { buildGoogleCalendarLinkUrl } from "@/lib/google/oauth";

describe("buildGoogleCalendarLinkUrl", () => {
  it("builds a google consent url for linking calendars", () => {
    const url = new URL(buildGoogleCalendarLinkUrl("state-123"));

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("test-google-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/google/callback",
    );
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent select_account");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("scope")).toContain(
      "https://www.googleapis.com/auth/calendar.readonly",
    );
  });
});
