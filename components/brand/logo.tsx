import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizeMap = {
  sm: { mark: 28, word: "text-base" },
  md: { mark: 32, word: "text-lg" },
  lg: { mark: 40, word: "text-xl" },
};

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <>
      <Image
        src="/brand/logo-mark.png"
        alt="Content OS logo"
        width={s.mark}
        height={s.mark}
        className="shrink-0"
      />
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
