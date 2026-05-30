import type { User } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getDecryptedKey } from "@/lib/user-settings";

export type ExportedUserKeys = {
  id: string;
  email: string;
  displayName: string;
  keys: {
    tavily: string | null;
    firecrawl: string | null;
    openrouter: string | null;
    nvidia: string | null;
    openai: string | null;
  };
  updatedAt: string;
};

function decryptUserKeys(user: User): ExportedUserKeys["keys"] {
  return {
    tavily: getDecryptedKey(user, "tavilyApiKey"),
    firecrawl: getDecryptedKey(user, "firecrawlApiKey"),
    openrouter: getDecryptedKey(user, "openrouterKey"),
    nvidia: getDecryptedKey(user, "nvidiaKey"),
    openai: getDecryptedKey(user, "openaiKey"),
  };
}

export async function exportAllUserKeys(): Promise<ExportedUserKeys[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    keys: decryptUserKeys(user),
    updatedAt: user.updatedAt.toISOString(),
  }));
}

export function userKeysToCsv(rows: ExportedUserKeys[]): string {
  const header =
    "email,displayName,tavily,firecrawl,openrouter,nvidia,openai,updatedAt";
  const escape = (value: string | null) => {
    const cell = value ?? "";
    if (/[",\n]/.test(cell)) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const lines = rows.map((row) =>
    [
      escape(row.email),
      escape(row.displayName),
      escape(row.keys.tavily),
      escape(row.keys.firecrawl),
      escape(row.keys.openrouter),
      escape(row.keys.nvidia),
      escape(row.keys.openai),
      escape(row.updatedAt),
    ].join(","),
  );

  return [header, ...lines].join("\n");
}
