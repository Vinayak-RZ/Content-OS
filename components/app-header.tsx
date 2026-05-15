import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AppHeader({ title, breadcrumb = "Pages" }: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 px-8 py-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {breadcrumb} / <span className="text-foreground/80">{title}</span>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Badge variant="default" dot>
        Operational
      </Badge>
    </header>
  );
}
