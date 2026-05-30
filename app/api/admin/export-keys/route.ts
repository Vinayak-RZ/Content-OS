import { NextResponse } from "next/server";

import {
  exportAllUserKeys,
  userKeysToCsv,
} from "@/lib/admin/export-user-keys";
import { requireAdminSecret } from "@/lib/admin/require-admin";
import { errorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Admin-only export of decrypted user API keys.
 * Requires `Authorization: Bearer <ADMIN_SECRET>`.
 */
export async function GET(request: Request) {
  try {
    requireAdminSecret(request);

    const url = new URL(request.url);
    const format = url.searchParams.get("format") ?? "json";

    const rows = await exportAllUserKeys();

    if (format === "csv") {
      const csv = userKeysToCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="user-api-keys.csv"',
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(
      { exportedAt: new Date().toISOString(), users: rows },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
