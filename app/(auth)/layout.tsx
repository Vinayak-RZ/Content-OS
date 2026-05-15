import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
          <span className="text-sm font-bold">C</span>
        </span>
        <span className="text-xl font-semibold tracking-tight">Content OS</span>
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
