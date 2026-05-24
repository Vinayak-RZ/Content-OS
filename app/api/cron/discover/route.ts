import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { runDiscoveryForUser } from "@/lib/discovery/orchestrator";
import {
  buildDiscoveryDigestHtml,
  sendDiscoveryDigestEmail,
} from "@/lib/email/resend";

export const maxDuration = 300;

export async function POST(request: Request) {
  const secret =
    typeof process.env["CRON_SECRET"] === "string"
      ? process.env["CRON_SECRET"].trim()
      : "";
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "CRON_SECRET is not configured. Set CRON_SECRET in production for cron.",
      },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { emailDigest: true },
    select: { id: true, email: true, displayName: true },
  });

  const outcomes: { userId: string; ok: boolean; error?: string }[] = [];

  const appUrl =
    typeof process.env["NEXT_PUBLIC_APP_URL"] === "string"
      ? process.env["NEXT_PUBLIC_APP_URL"].trim().replace(/\/$/, "")
      : "";

  for (const u of users) {
    const t0 = Date.now();
    try {
      const r = await runDiscoveryForUser(u.id);
      await prisma.cronLog.create({
        data: {
          userId: u.id,
          success: true,
          sourceCounts: r.sourceCounts as unknown as Prisma.InputJsonValue,
          totalDiscovered: r.newStored + r.carriedOver,
          durationMs: Date.now() - t0,
        },
      });

      const highlights = await prisma.trend.findMany({
        where: { userId: u.id, discoveryBatchId: r.batchId },
        orderBy: { finalScore: "desc" },
        take: 6,
        select: { title: true, finalScore: true },
      });

      const html = buildDiscoveryDigestHtml({
        displayName: u.displayName,
        topics: highlights,
        appUrl,
      });

      await sendDiscoveryDigestEmail({
        to: u.email,
        subject: `Content OS — ${r.newStored + r.carriedOver} topics ranked`,
        html,
      });

      outcomes.push({ userId: u.id, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await prisma.cronLog.create({
        data: {
          userId: u.id,
          success: false,
          sourceCounts: {},
          totalDiscovered: 0,
          durationMs: Date.now() - t0,
          errorMessage: msg.slice(0, 2000),
        },
      });
      outcomes.push({ userId: u.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({
    ok: true,
    usersProcessed: users.length,
    outcomes,
  });
}
