export type BufferService = "linkedin" | "twitter" | string;

export type PostMetricUnit = "count" | "percentage";

export type PostMetric = {
  type: string;
  name: string;
  value: number;
  unit: PostMetricUnit;
};

export type BufferOrganization = {
  id: string;
  name: string;
};

export type BufferChannel = {
  id: string;
  name: string;
  displayName: string | null;
  service: BufferService;
  avatar: string | null;
  isQueuePaused: boolean;
};

export type BufferPost = {
  id: string;
  text: string;
  status: string;
  channelId: string;
  dueAt: string | null;
  metrics: PostMetric[];
  metricsUpdatedAt: string | null;
};

export type BufferPageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

export type CreatePostMode = "addToQueue" | "customScheduled";

export type CreatePostResult =
  | { ok: true; post: { id: string; status: string; text: string } }
  | { ok: false; message: string };

export const SUPPORTED_BUFFER_SERVICES = ["linkedin", "twitter"] as const;

export type SupportedBufferService = (typeof SUPPORTED_BUFFER_SERVICES)[number];

export function isSupportedBufferService(
  service: string,
): service is SupportedBufferService {
  return (SUPPORTED_BUFFER_SERVICES as readonly string[]).includes(service);
}

export function serviceLabel(service: string): string {
  if (service === "linkedin") return "LinkedIn";
  if (service === "twitter") return "X";
  return service;
}
