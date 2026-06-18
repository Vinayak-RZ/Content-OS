import { prisma } from "@/lib/db";
import { buildPublicationByDay } from "@/lib/analytics/date-buckets";
import type { DayCount } from "@/lib/analytics/date-buckets";
import {
  getMetricValue,
  parsePostMetrics,
} from "@/lib/analytics/social-post-metrics";
import { serviceLabel } from "@/lib/buffer/types";

export type BufferAnalyticsSummary = {
  connected: boolean;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  channelCount: number;
  postCount: number;
  publishedThisWeek: number;
  publishedByDay: DayCount[];
  totals: {
    impressions: number;
    reactions: number;
    comments: number;
    reposts: number;
    engagementRate: number | null;
  };
  posts: BufferPostListItem[];
};

export type BufferPostListItem = {
  id: string;
  textPreview: string;
  platform: string;
  channelName: string;
  publishedAt: string | null;
  impressions: number | null;
  reactions: number | null;
  comments: number | null;
  reposts: number | null;
  engagementRate: number | null;
  metricsUpdatedAt: string | null;
  draftId: string | null;
};

function textPreview(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export async function fetchBufferAnalyticsSummary(
  userId: string,
): Promise<BufferAnalyticsSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bufferApiKey: true,
      bufferOrganizationId: true,
      bufferLastSyncAt: true,
      bufferLastSyncError: true,
    },
  });

  if (!user?.bufferApiKey || !user.bufferOrganizationId) {
    return null;
  }

  const [channelCount, posts, sentPostsForChart, postCount] = await Promise.all([
    prisma.bufferChannel.count({ where: { userId } }),
    prisma.socialPost.findMany({
      where: { userId },
      include: {
        channel: {
          select: { service: true, displayName: true, name: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 50,
    }),
    prisma.socialPost.findMany({
      where: {
        userId,
        status: "sent",
        publishedAt: { not: null },
      },
      select: { publishedAt: true },
    }),
    prisma.socialPost.count({
      where: { userId, status: "sent", publishedAt: { not: null } },
    }),
  ]);

  const { publishedByDay, publishedThisWeek } = buildPublicationByDay(
    sentPostsForChart
      .map((p) => p.publishedAt)
      .filter((d): d is Date => d != null),
  );

  let impressions = 0;
  let reactions = 0;
  let comments = 0;
  let reposts = 0;
  const engagementRates: number[] = [];

  for (const post of posts) {
    const imp = getMetricValue(post.metrics, "impressions");
    const react = getMetricValue(post.metrics, "reactions");
    const comm = getMetricValue(post.metrics, "comments");
    const rep = getMetricValue(post.metrics, "reposts");
    const rate = getMetricValue(post.metrics, "engagementRate");
    if (imp != null) impressions += imp;
    if (react != null) reactions += react;
    if (comm != null) comments += comm;
    if (rep != null) reposts += rep;
    if (rate != null) engagementRates.push(rate);
  }

  const engagementRate =
    engagementRates.length > 0
      ? engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length
      : null;

  return {
    connected: true,
    lastSyncAt: user.bufferLastSyncAt?.toISOString() ?? null,
    lastSyncError: user.bufferLastSyncError,
    channelCount,
    postCount,
    publishedThisWeek,
    publishedByDay,
    totals: {
      impressions,
      reactions,
      comments,
      reposts,
      engagementRate,
    },
    posts: posts.map((post) => ({
      id: post.id,
      textPreview: textPreview(post.text),
      platform: serviceLabel(post.channel.service),
      channelName: post.channel.displayName ?? post.channel.name,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      impressions: getMetricValue(post.metrics, "impressions"),
      reactions: getMetricValue(post.metrics, "reactions"),
      comments: getMetricValue(post.metrics, "comments"),
      reposts: getMetricValue(post.metrics, "reposts"),
      engagementRate: getMetricValue(post.metrics, "engagementRate"),
      metricsUpdatedAt: post.metricsUpdatedAt?.toISOString() ?? null,
      draftId: post.draftId,
    })),
  };
}

export async function fetchSocialPostDetail(userId: string, postId: string) {
  const post = await prisma.socialPost.findFirst({
    where: { id: postId, userId },
    include: {
      channel: true,
      draft: { select: { id: true, topicTitle: true } },
      metricSnapshots: {
        orderBy: { recordedAt: "desc" },
        take: 100,
      },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    bufferPostId: post.bufferPostId,
    text: post.text,
    status: post.status,
    platform: serviceLabel(post.channel.service),
    channelName: post.channel.displayName ?? post.channel.name,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    metricsUpdatedAt: post.metricsUpdatedAt?.toISOString() ?? null,
    lastSyncedAt: post.lastSyncedAt?.toISOString() ?? null,
    metrics: parsePostMetrics(post.metrics),
    draft: post.draft,
    snapshots: post.metricSnapshots.map((s) => ({
      type: s.type,
      name: s.name,
      value: s.value,
      unit: s.unit,
      recordedAt: s.recordedAt.toISOString(),
    })),
  };
}
