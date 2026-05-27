"use client";

import type { DayCount } from "@/lib/analytics/summary";

function formatDayLabel(dateKey: string, mobileOnlyDate: boolean): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (mobileOnlyDate) {
    return d.toLocaleDateString(undefined, { day: "numeric" });
  }
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

export function PublicationChart({ data }: { data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-44 items-end gap-1 sm:h-48 sm:gap-2">
      {data.map((day) => {
        const heightPct = (day.count / max) * 100;
        return (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:gap-2"
          >
            <span className="font-heading text-[10px] font-semibold tabular-nums text-muted-foreground">
              {day.count > 0 ? day.count : ""}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-sm bg-brand transition-[height] duration-300 ease-out"
                style={{
                  height: `${Math.max(day.count > 0 ? 8 : 2, heightPct)}%`,
                  minHeight: day.count > 0 ? "0.5rem" : "2px",
                  opacity: day.count > 0 ? 1 : 0.2,
                }}
                title={`${day.date}: ${day.count} published`}
              />
            </div>
            {/* Mobile: day number only to avoid overlap */}
            <span className="truncate text-[10px] text-muted-foreground sm:hidden">
              {formatDayLabel(day.date, true)}
            </span>
            <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
              {formatDayLabel(day.date, false)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
