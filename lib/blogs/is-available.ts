import { Prisma } from "@prisma/client";

/** True when BlogPost table/model is missing (migration not applied yet). */
export function isBlogDatastoreError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2021: table does not exist; P2022: column does not exist
    return error.code === "P2021" || error.code === "P2022";
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return /BlogPost|blogPost/i.test(error.message);
  }

  if (error instanceof TypeError) {
    return /findMany|blogPost/i.test(error.message);
  }

  if (error instanceof Error) {
    const message = error.message;
    return (
      /BlogPost/i.test(message) ||
      /does not exist/i.test(message) ||
      /relation.*blog/i.test(message)
    );
  }

  return false;
}

export function logBlogDatastoreWarning(error: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    "[blogs] BlogPost datastore unavailable — run `npm run db:migrate` (not `npm run db migrate`).",
    error,
  );
}
