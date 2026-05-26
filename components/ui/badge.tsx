import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-heading text-[11px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-subtle bg-card text-foreground",
        brand: "border-brand-border bg-brand-muted text-brand",
        brandSolid: "border-transparent bg-brand text-brand-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        forest: "border-transparent bg-forest text-forest-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({
  className,
  variant,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full bg-brand"
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
