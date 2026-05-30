"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useNavigationProgress } from "@/lib/client/navigation-progress";

export function useAppRouter() {
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();

  return useMemo(
    () => ({
      push: (href: string) => {
        startNavigation(href);
        router.push(href);
      },
      replace: (href: string) => {
        startNavigation(href);
        router.replace(href);
      },
      refresh: router.refresh,
      back: router.back,
      forward: router.forward,
      prefetch: router.prefetch,
    }),
    [router, startNavigation],
  );
}
