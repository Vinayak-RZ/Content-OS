import { bufferGraphql } from "@/lib/buffer/client";
import type {
  BufferChannel,
  BufferOrganization,
  BufferPageInfo,
  BufferPost,
  PostMetric,
} from "@/lib/buffer/types";

const ORGANIZATIONS_QUERY = `
  query GetOrganizations {
    organizations {
      id
      name
    }
  }
`;

const CHANNELS_QUERY = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      displayName
      service
      avatar
      isQueuePaused
    }
  }
`;

const POSTS_WITH_METRICS_QUERY = `
  query GetPostsWithMetrics(
    $first: Int!
    $after: String
    $organizationId: OrganizationId!
    $channelIds: [ChannelId!]
  ) {
    posts(
      first: $first
      after: $after
      input: {
        organizationId: $organizationId
        filter: { status: [sent], channelIds: $channelIds }
      }
    ) {
      edges {
        node {
          id
          text
          status
          channelId
          dueAt
          metrics {
            type
            name
            value
            unit
          }
          metricsUpdatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const AGGREGATED_METRICS_QUERY = `
  query AggregatedPostMetrics(
    $organizationId: OrganizationId!
    $startDateTime: DateTime!
    $endDateTime: DateTime!
    $channelIds: [ChannelId!]
  ) {
    aggregatedPostMetrics(
      input: {
        organizationId: $organizationId
        startDateTime: $startDateTime
        endDateTime: $endDateTime
        channelIds: $channelIds
      }
    ) {
      metrics {
        type
        name
        value
        unit
      }
      metricsUpdatedAt
    }
  }
`;

export async function fetchBufferOrganizations(
  apiKey: string,
): Promise<BufferOrganization[]> {
  const data = await bufferGraphql<{ organizations: BufferOrganization[] }>(
    apiKey,
    ORGANIZATIONS_QUERY,
  );
  return data.organizations ?? [];
}

export async function fetchBufferChannels(
  apiKey: string,
  organizationId: string,
): Promise<BufferChannel[]> {
  const data = await bufferGraphql<{ channels: BufferChannel[] }>(
    apiKey,
    CHANNELS_QUERY,
    { organizationId },
  );
  return data.channels ?? [];
}

export async function fetchBufferPostsPage(
  apiKey: string,
  input: {
    organizationId: string;
    channelIds: string[];
    first?: number;
    after?: string | null;
  },
): Promise<{ posts: BufferPost[]; pageInfo: BufferPageInfo }> {
  const data = await bufferGraphql<{
    posts: {
      edges: { node: BufferPost }[];
      pageInfo: BufferPageInfo;
    };
  }>(apiKey, POSTS_WITH_METRICS_QUERY, {
    organizationId: input.organizationId,
    channelIds: input.channelIds,
    first: input.first ?? 50,
    after: input.after ?? null,
  });

  return {
    posts: data.posts.edges.map((edge) => edge.node),
    pageInfo: data.posts.pageInfo,
  };
}

export async function fetchAllBufferPosts(
  apiKey: string,
  input: {
    organizationId: string;
    channelIds: string[];
    maxPosts?: number;
  },
): Promise<BufferPost[]> {
  const maxPosts = input.maxPosts ?? 500;
  const all: BufferPost[] = [];
  let after: string | null = null;

  while (all.length < maxPosts) {
    const page = await fetchBufferPostsPage(apiKey, {
      organizationId: input.organizationId,
      channelIds: input.channelIds,
      after,
    });
    all.push(...page.posts);
    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break;
    after = page.pageInfo.endCursor;
  }

  return all.slice(0, maxPosts);
}

export async function fetchAggregatedPostMetrics(
  apiKey: string,
  input: {
    organizationId: string;
    channelIds: string[];
    startDateTime: string;
    endDateTime: string;
  },
): Promise<{ metrics: PostMetric[]; metricsUpdatedAt: string | null }> {
  const data = await bufferGraphql<{
    aggregatedPostMetrics: {
      metrics: PostMetric[];
      metricsUpdatedAt: string | null;
    };
  }>(apiKey, AGGREGATED_METRICS_QUERY, input);

  return data.aggregatedPostMetrics;
}
