"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/brand/logo";
import { useNavigationProgress } from "@/lib/client/navigation-progress";
import { cn } from "@/lib/utils";

const navItems: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Drafts", href: "/drafts", icon: FileText },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function SidebarNav({
  onNavigate,
  showLogo = true,
}: {
  onNavigate?: () => void;
  showLogo?: boolean;
}) {
  const pathname = usePathname();
  const { pendingPath, startNavigation } = useNavigationProgress();

  return (
    <>
      {showLogo ? (
        <div className="px-5 py-6">
          <Logo href="/" size="sm" />
        </div>
      ) : null}

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.disabled &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const isPending = pendingPath === item.href;

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              prefetch
              onClick={() => {
                if (!item.disabled) {
                  startNavigation(item.href);
                  onNavigate?.();
                }
              }}
              aria-disabled={item.disabled}
              aria-current={isActive ? "page" : undefined}
              aria-busy={isPending || undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 font-heading text-sm font-semibold transition-colors duration-150 ease-out",
                isActive
                  ? "bg-card text-foreground shadow-pill"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                isPending && "bg-muted/50 text-foreground",
                item.disabled && "pointer-events-none opacity-40",
              )}
            >
              {isPending ? (
                <Loader2
                  className="size-4 shrink-0 animate-spin"
                  aria-hidden
                />
              ) : (
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-subtle p-4">
        <SignOutButton variant="ghost" size="sm" className="w-full justify-start" />
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-subtle bg-sidebar">
      <SidebarNav />
    </aside>
  );
}
