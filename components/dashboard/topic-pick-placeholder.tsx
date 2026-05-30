import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TopicPickPlaceholder({ slot }: { slot: number }) {
  return (
    <Card className="flex h-full min-h-[220px] flex-col border-dashed border-subtle bg-muted/20 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pick {slot}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-heading text-[10px] font-semibold text-muted-foreground">
            Empty
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pb-8">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Run discovery to fill this slot with a ranked topic from your pool.
        </p>
      </CardContent>
    </Card>
  );
}
