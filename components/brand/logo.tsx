import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizeMap = {
  sm: { mark: "size-7 text-[10px]", word: "text-base" },
  md: { mark: "size-8 text-xs", word: "text-lg" },
  lg: { mark: "size-10 text-sm", word: "text-xl" },
};

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-forest font-heading font-semibold text-forest-foreground",
          s.mark,
        )}
        aria-hidden
      >
        C
      </span>
      <span className={cn("font-heading font-semibold tracking-tight", s.word)}>
        Content OS
      </span>
    </>
  );

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {content}
    </Link>
  );
}
