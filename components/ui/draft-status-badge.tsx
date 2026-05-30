import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DraftStatus = "draft" | "approved" | "published";

const statusStyles: Record<
  DraftStatus,
  { label: string; className: string; variant: "muted" | "brand" | "forest" }
> = {
  draft: {
    label: "Draft",
    variant: "muted",
    className: "border-subtle bg-muted text-foreground",
  },
  approved: {
    label: "Approved",
    variant: "brand",
    className: "border-brand-border bg-brand-muted text-brand",
  },
  published: {
    label: "Published",
    variant: "forest",
    className: "border-forest/20 bg-forest text-forest-foreground",
  },
};

export function DraftStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = (status in statusStyles ? status : "draft") as DraftStatus;
  const config = statusStyles[key];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "rounded-md px-2.5 py-0.5 font-heading text-[11px] font-semibold normal-case tracking-wide",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}

export function DraftOpenBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="default"
      className={cn(
        "rounded-md border-brand-border bg-brand px-2.5 py-0.5 font-heading text-[11px] font-semibold normal-case tracking-wide text-brand-foreground shadow-pill transition-colors hover:bg-brand/90",
        className,
      )}
    >
      Open
    </Badge>
  );
}
