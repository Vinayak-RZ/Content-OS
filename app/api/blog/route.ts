import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { listRecentBlogs } from "@/lib/blogs/list";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    const blogs = await listRecentBlogs(session.user.id, 12);
    return NextResponse.json({ blogs });
  } catch (error) {
    return errorResponse(error);
  }
}
