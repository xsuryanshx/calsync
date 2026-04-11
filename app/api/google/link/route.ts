import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { buildGoogleCalendarLinkUrl } from "@/lib/google/oauth";
import { getCurrentUserId } from "@/lib/auth/session";

const STATE_COOKIE = "calsync_google_link_state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(buildGoogleCalendarLinkUrl(state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
