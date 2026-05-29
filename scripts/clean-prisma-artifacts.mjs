/**
 * Prune Prisma engine artifacts that inflate Vercel serverless bundles.
 * Runs after `prisma generate` (see package.json postinstall).
 */
import { readdirSync, rmSync, statSync, unlinkSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

function unlinkIfExists(path) {
  try {
    unlinkSync(path);
    console.log(`[prisma-clean] removed ${path}`);
  } catch {
    // ignore
  }
}

function rmDirIfExists(path) {
  try {
    rmSync(path, { recursive: true, force: true });
    console.log(`[prisma-clean] removed dir ${path}`);
  } catch {
    // ignore
  }
}

function cleanClientDir(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    const full = join(dir, name);
    if (name.includes(".tmp")) {
      unlinkIfExists(full);
      continue;
    }

    if (name.startsWith("schema-engine")) {
      unlinkIfExists(full);
      continue;
    }

    if (process.env.VERCEL === "1") {
      if (
        name.includes("windows") ||
        name.includes("darwin") ||
        name.includes("debian") ||
        name.includes("linux-arm") ||
        name.includes("musl")
      ) {
        unlinkIfExists(full);
      }
    }
  }
}

function cleanEnginesPackage(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    const full = join(dir, name);
    if (name.startsWith("schema-engine") || name.includes(".tmp")) {
      unlinkIfExists(full);
      continue;
    }
    if (process.env.VERCEL === "1" && name.includes("windows")) {
      unlinkIfExists(full);
    }
  }
}

cleanClientDir(join(ROOT, "node_modules", ".prisma", "client"));
cleanEnginesPackage(join(ROOT, "node_modules", "@prisma", "engines"));
rmDirIfExists(
  join(ROOT, "node_modules", "@prisma", "engines", "node_modules", ".cache"),
);

try {
  const prismaRoot = join(ROOT, "node_modules", ".prisma");
  for (const name of readdirSync(prismaRoot)) {
    const full = join(prismaRoot, name);
    if (statSync(full).isFile() && name.includes("query_engine")) {
      unlinkIfExists(full);
    }
  }
} catch {
  // ignore
}
