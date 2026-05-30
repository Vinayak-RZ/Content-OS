"use client";

import { useEffect, useRef } from "react";

import { NavigationProgressProvider } from "@/lib/client/navigation-progress";
import { SidebarNav } from "@/components/app-sidebar";
import { Logo } from "@/components/brand/logo";
import { KeyboardShortcuts } from "@/components/navigation/keyboard-shortcuts";
import { RouteProgress } from "@/components/navigation/route-progress";
import { useFocusTrap } from "@/lib/client/focus-trap";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(mobileOpen, menuRef, menuButtonRef);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <NavigationProgressProvider>
      <div className="flex min-h-screen">
      <KeyboardShortcuts onCloseMobileMenu={() => setMobileOpen(false)} />

      <aside className="hidden w-60 shrink-0 flex-col border-r border-subtle bg-sidebar lg:flex">
        <SidebarNav />
      </aside>

      <button
        type="button"
        aria-label="Close menu"
        tabIndex={mobileOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-forest/50 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        ref={menuRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-subtle bg-sidebar shadow-ambient transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between border-b border-subtle px-4 py-4">
          <Logo href="/" size="sm" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <SidebarNav showLogo={false} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-subtle bg-background/95 px-4 backdrop-blur-sm lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" />
          </button>
          <Logo href="/dashboard" size="sm" className="min-w-0 truncate" />
        </header>
        {children}
      </div>

      <RouteProgress />
      </div>
    </NavigationProgressProvider>
  );
}
