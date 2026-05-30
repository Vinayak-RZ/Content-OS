"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { ContentProgress } from "@/components/navigation/content-progress";
import { cn } from "@/lib/utils";

/**
 * Full-viewport centered progress while an in-app link navigation is in flight.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let next: URL;
      try {
        next = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (next.origin !== window.location.origin) return;
      if (next.pathname === pathnameRef.current) return;

      setPending(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!pending) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/55 backdrop-blur-[1px]",
      )}
      aria-hidden
    >
      <div className="rounded-xl border border-subtle bg-card px-6 py-5 shadow-ambient">
        <ContentProgress label="Opening page" />
      </div>
    </div>
  );
}
