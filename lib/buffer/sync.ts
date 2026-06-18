import type { User } from "@prisma/client";

import {
  fetchAllBufferPosts,
  fetchBufferChannels,
} from "@/lib/buffer/queries";
import { requireBufferCredentials } from "@/lib/buffer/credentials";
import type { PostMetric } from "@/lib/buffer/types";
import { isSupportedBufferService } from "@/lib/buffer/types";
import { prisma } from "@/lib/db";

export type BufferSyncResult = {
  channelsSynced: number;
  postsSynced: number;
};

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

async function upsertMetricSnapshots(
  socialPostId: string,
  metrics: PostMetric[],
): Promise<void> {
  const dayStart = startOfUtcDay(new Date());

  for (const metric of metrics) {
    const existing = await prisma.socialPostMetricSnapshot.findFirst({
      where: {
        socialPostId,
        type: metric.type,
        recordedAt: { gte: dayStart },
      },
    });
    if (existing) continue;

    await prisma.socialPostMetricSnapshot.create({
      data: {
        socialPostId,
        type: metric.type,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        recordedAt: new Date(),
      },
    });
  }
}

export async function syncBufferForUser(user: User): Promise<BufferSyncResult> {
  const { apiKey, organizationId } = requireBufferCredentials(user);
  const now = new Date();

  const remoteChannels = await fetchBufferChannels(apiKey, organizationId);
  const supportedChannels = remoteChannels.filter((ch) =>
    isSupportedBufferService(ch.service),
  );

  const channelIdMap = new Map<string, string>();

  for (const remote of supportedChannels) {
    const row = await prisma.bufferChannel.upsert({
      where: {
        userId_bufferChannelId: {
          userId: user.id,
          bufferChannelId: remote.id,
        },
      },
      create: {
        userId: user.id,
        bufferChannelId: remote.id,
        organizationId,
        service: remote.service,
        name: remote.name,
        displayName: remote.displayName,
        avatar: remote.avatar,
        isQueuePaused: remote.isQueuePaused,
        lastSyncedAt: now,
      },
      update: {
        organizationId,
        service: remote.service,
        name: remote.name,
        displayName: remote.displayName,
        avatar: remote.avatar,
        isQueuePaused: remote.isQueuePaused,
        lastSyncedAt: now,
      },
    });
    channelIdMap.set(remote.id, row.id);
  }

  const bufferChannelIds = supportedChannels.map((ch) => ch.id);
  if (bufferChannelIds.length === 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        bufferLastSyncAt: now,
        bufferLastSyncError: null,
      },
    });
    return { channelsSynced: 0, postsSynced: 0 };
  }

  const remotePosts = await fetchAllBufferPosts(apiKey, {
    organizationId,
    channelIds: bufferChannelIds,
  });

  let postsSynced = 0;

  for (const remote of remotePosts) {
    const localChannelId = channelIdMap.get(remote.channelId);
    if (!localChannelId) continue;

    const metrics = remote.metrics ?? [];
    const publishedAt = remote.dueAt ? new Date(remote.dueAt) : null;

    const socialPost = await prisma.socialPost.upsert({
      where: {
        userId_bufferPostId: {
          userId: user.id,
          bufferPostId: remote.id,
        },
      },
      create: {
        userId: user.id,
        bufferPostId: remote.id,
        channelId: localChannelId,
        text: remote.text,
        status: remote.status,
        publishedAt,
        metricsUpdatedAt: remote.metricsUpdatedAt
          ? new Date(remote.metricsUpdatedAt)
          : null,
        metrics,
        lastSyncedAt: now,
      },
      update: {
        channelId: localChannelId,
        text: remote.text,
        status: remote.status,
        publishedAt,
        metricsUpdatedAt: remote.metricsUpdatedAt
          ? new Date(remote.metricsUpdatedAt)
          : null,
        metrics,
        lastSyncedAt: now,
      },
    });

    await upsertMetricSnapshots(socialPost.id, metrics);
    postsSynced += 1;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bufferLastSyncAt: now,
      bufferLastSyncError: null,
    },
  });

  return {
    channelsSynced: supportedChannels.length,
    postsSynced,
  };
}

export async function recordBufferSyncError(
  userId: string,
  message: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { bufferLastSyncError: message.slice(0, 500) },
  });
}
