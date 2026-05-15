import { NextResponse } from "next/server";
import { getEnvOrNull } from "@/lib/env";

export async function GET() {
  const envStatus = getEnvOrNull() ? "configured" : "missing";
  return NextResponse.json({
    ok: true,
    service: "content-os",
    phase: 0,
    env: envStatus,
  });
}
