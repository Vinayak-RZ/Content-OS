import {
  assembleLinkedInPost,
  buildTwitterThreadMetadata,
} from "@/lib/buffer/assemble";
import { createBufferPost } from "@/lib/buffer/mutations";
import { requireBufferCredentials } from "@/lib/buffer/credentials";
import type { CreatePostMode } from "@/lib/buffer/types";
import { prisma } from "@/lib/db";
import type { BufferPublishInput } from "@/lib/validations/buffer";

export type PublishToBufferResult = {
  socialPostId: string;
  bufferPostId: string;
  status: string;
};

export async function publishDraftToBuffer(
  userId: string,
  input: BufferPublishInput,
): Promise<PublishToBufferResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { apiKey } = requireBufferCredentials(user);

  const [draft, channel] = await Promise.all([
    prisma.draft.findFirst({
      where: { id: input.draftId, userId },
    }),
    prisma.bufferChannel.findFirst({
      where: { id: input.channelId, userId },
    }),
  ]);

  if (!draft) {
    throw new Error("Draft not found.");
  }
  if (!channel) {
    throw new Error("Buffer channel not found. Sync channels in Settings or Analytics.");
  }

  const mode: CreatePostMode = input.mode;
  const dueAt = input.dueAt;

  let text = "";
  let metadata: { twitter: { thread: { text: string }[] } } | undefined;

  if (channel.service === "linkedin") {
    text = assembleLinkedInPost(draft);
  } else if (channel.service === "twitter") {
    if (draft.xThreadParts.length === 0) {
      throw new Error(
        "Generate an X thread before publishing to an X channel.",
      );
    }
    const built = buildTwitterThreadMetadata(draft.xThreadParts);
    text = built.text;
    metadata = built.metadata;
  } else {
    throw new Error("Only LinkedIn and X channels are supported.");
  }

  const result = await createBufferPost(apiKey, {
    text,
    channelId: channel.bufferChannelId,
    schedulingType: "automatic",
    mode,
    dueAt,
    metadata,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  const now = new Date();
  const scheduledAt = mode === "customScheduled" && dueAt ? new Date(dueAt) : null;
  const isSent = result.post.status === "sent";

  const socialPost = await prisma.socialPost.upsert({
    where: {
      userId_bufferPostId: {
        userId,
        bufferPostId: result.post.id,
      },
    },
    create: {
      userId,
      bufferPostId: result.post.id,
      channelId: channel.id,
      draftId: draft.id,
      text: result.post.text,
      status: result.post.status,
      publishedAt: isSent ? now : null,
      scheduledAt,
      metrics: [],
      lastSyncedAt: now,
    },
    update: {
      channelId: channel.id,
      draftId: draft.id,
      text: result.post.text,
      status: result.post.status,
      publishedAt: isSent ? now : undefined,
      scheduledAt,
      lastSyncedAt: now,
    },
  });

  if (isSent) {
    await prisma.draft.update({
      where: { id: draft.id },
      data: {
        status: "published",
        publishedAt: draft.publishedAt ?? now,
      },
    });
  } else if (draft.status === "draft") {
    await prisma.draft.update({
      where: { id: draft.id },
      data: { status: "approved" },
    });
  }

  return {
    socialPostId: socialPost.id,
    bufferPostId: result.post.id,
    status: result.post.status,
  };
}
