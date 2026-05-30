"use client";

import { useEffect, useState } from "react";
import { useAppRouter } from "@/lib/client/use-app-router";

const SHORTCUTS = [
  { keys: "?", action: "Show keyboard shortcuts" },
  { keys: "g then d", action: "Go to Dashboard" },
  { keys: "g then k", action: "Go to Knowledge" },
  { keys: "Esc", action: "Close menus and overlays" },
] as const;

export function KeyboardShortcuts({
  onCloseMobileMenu,
}: {
  onCloseMobileMenu?: () => void;
}) {
  const router = useAppRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const [awaitG, setAwaitG] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        setHelpOpen(false);
        setAwaitG(false);
        onCloseMobileMenu?.();
        return;
      }

      if (typing) return;

      if (helpOpen && event.key !== "?") {
        setHelpOpen(false);
      }

      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      if (awaitG) {
        setAwaitG(false);
        if (event.key === "d") {
          event.preventDefault();
          router.push("/dashboard");
        } else if (event.key === "k") {
          event.preventDefault();
          router.push("/knowledge");
        }
        return;
      }

      if (event.key === "g") {
        setAwaitG(true);
        window.setTimeout(() => setAwaitG(false), 1200);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [awaitG, helpOpen, onCloseMobileMenu, router]);

  if (!helpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={() => setHelpOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-subtle bg-card p-5 shadow-ambient"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="shortcuts-title" className="font-heading text-base font-semibold">
          Keyboard shortcuts
        </h2>
        <ul className="mt-4 space-y-2">
          {SHORTCUTS.map((item) => (
            <li
              key={item.keys}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="text-muted-foreground">{item.action}</span>
              <kbd className="rounded-md border border-subtle bg-muted/50 px-2 py-0.5 font-heading text-xs font-semibold">
                {item.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Press Esc or ? to close.
        </p>
      </div>
    </div>
  );
}
