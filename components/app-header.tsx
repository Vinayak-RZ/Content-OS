import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
  description?: string;
}

export function AppHeader({
  title,
  breadcrumb = "Workspace",
  description,
}: AppHeaderProps) {
  return (
    <header className="page-x border-b border-subtle bg-background py-4 sm:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {breadcrumb}
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Badge variant="brand" dot className="shrink-0">
          Live
        </Badge>
      </div>
    </header>
  );
}
