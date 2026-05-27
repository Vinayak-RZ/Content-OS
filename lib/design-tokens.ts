/**
 * Content OS design tokens - Tavily-inspired layout, brand orange #F75440.
 * CSS variables live in app/globals.css; use Tailwind classes in components.
 */
export const brand = {
  hex: "#F75440",
  hsl: "8 92% 61%",
} as const;

export const designNotes = {
  surfaces: "Warm cream background (#FAF9F7 range), white cards, soft sidebar",
  accent: "Replace Tavily green with brand orange for progress, pills, CTAs, status dot",
  radius: "rounded-2xl cards, rounded-full pills/buttons",
  shadow: "shadow-card on panels, shadow-pill on chips",
} as const;
