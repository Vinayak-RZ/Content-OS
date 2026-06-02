/** Onboarding steps - shared by landing UI and HowTo JSON-LD. */
export const ONBOARDING_STEPS = [
  {
    num: "01",
    label: "Start free",
    detail:
      "Try as guest from the login page (no account), or sign in with Google to save your work.",
  },
  {
    num: "02",
    label: "Seed knowledge",
    detail: "Upload context files that define your angle.",
  },
  {
    num: "03",
    label: "Discover",
    detail: "Run discovery to populate your topic board.",
  },
  {
    num: "04",
    label: "Draft",
    detail: "Generate, edit, and ship when ready.",
  },
] as const;
