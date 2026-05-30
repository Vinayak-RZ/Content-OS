"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type NavigationProgressContextValue = {
  pendingPath: string | null;
  isNavigating: boolean;
  startNavigation: (href: string) => void;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

function normalizePath(path: string): string {
  try {
    const url = path.startsWith("http")
      ? new URL(path)
      : new URL(path, "http://local");
    return url.pathname;
  } catch {
    return path;
  }
}

export function NavigationProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
    setPendingPath(null);
  }, [pathname]);

  const startNavigation = useCallback((href: string) => {
    const next = normalizePath(href);
    if (next !== pathnameRef.current) {
      setPendingPath(next);
    }
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const next = new URL(anchor.href, window.location.href);
        if (next.origin !== window.location.origin) return;
        if (next.pathname === pathnameRef.current) return;
        setPendingPath(next.pathname);
      } catch {
        /* ignore invalid href */
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const value = useMemo(
    () => ({
      pendingPath,
      isNavigating: pendingPath !== null,
      startNavigation,
    }),
    [pendingPath, startNavigation],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

const noopNavigation: NavigationProgressContextValue = {
  pendingPath: null,
  isNavigating: false,
  startNavigation: () => {},
};

export function useNavigationProgress(): NavigationProgressContextValue {
  const ctx = useContext(NavigationProgressContext);
  return ctx ?? noopNavigation;
}
