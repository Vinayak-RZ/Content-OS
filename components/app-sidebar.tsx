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

import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
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
  isGuest = false,
}: {
  onNavigate?: () => void;
  showLogo?: boolean;
  isGuest?: boolean;
}) {
  const pathname = usePathname();
  const { pendingPath, startNavigation } = useNavigationProgress();

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showLogo ? (
        <div className="shrink-0 px-5 py-6">
          <Logo href="/" size="sm" />
        </div>
      ) : null}

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3">
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

      <div className="mt-auto shrink-0 border-t border-subtle bg-sidebar p-4">
        {isGuest ? (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs text-muted-foreground">Guest session</p>
            <SignInButton
              size="sm"
              callbackUrl="/dashboard"
              label="Sign in to save"
              className="w-full"
            />
            <Link href="/" className="w-full">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Back to home
              </Button>
            </Link>
          </div>
        ) : (
          <SignOutButton variant="ghost" size="sm" className="w-full justify-start" />
        )}
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-subtle bg-sidebar">
      <SidebarNav />
    </aside>
  );
}
