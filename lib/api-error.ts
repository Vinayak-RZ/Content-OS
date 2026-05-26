import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function prismaUserMessage(error: unknown): string | null {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2028"
  ) {
    return "Database is busy (connection pool). Wait a few seconds and try again.";
  }
  return null;
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
      { status: error.statusCode },
    );
  }
  const prismaMsg = prismaUserMessage(error);
  if (prismaMsg) {
    console.error(error);
    return NextResponse.json(
      {
        error: prismaMsg,
        code: "DB_BUSY",
        statusCode: 503,
      },
      { status: 503 },
    );
  }
  console.error(error);
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
    { status: 500 },
  );
}
