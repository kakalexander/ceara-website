import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    service: "ceara-website",
    timestamp: new Date().toISOString()
  });
}

