"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";

const navItems: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Drafts", href: "#", icon: FileText, disabled: true },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-sidebar px-4 py-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
          <span className="text-xs font-bold">C</span>
        </span>
        <span className="text-lg font-semibold tracking-tight">Content OS</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.disabled &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-pill"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                item.disabled && "pointer-events-none opacity-40",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-full border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground shadow-pill">
        Phase 3 · Discovery
      </div>
    </aside>
  );
}
