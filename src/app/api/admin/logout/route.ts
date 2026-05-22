import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/session";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), "", {
    path: "/",
    maxAge: 0
  });

  return response;
}

