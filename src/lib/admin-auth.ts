import { cookies } from "next/headers";

import { getSessionCookieName, verifySessionToken } from "@/lib/session";

export async function getAdminSession(): Promise<{ userId: number; email: string; role: string } | null> {
  const token = cookies().get(getSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
