export type { TrendCandidate, AdapterRunResult, DiscoverySourceCountsJson } from "@/lib/discovery/types";
export { canonicalizeUrl, urlSha256 } from "@/lib/discovery/urls";
export * from "@/lib/discovery/carry-over";
export * from "@/lib/discovery/dedup";
export { runDiscoveryForUser, type DiscoveryRunResult } from "@/lib/discovery/orchestrator";
