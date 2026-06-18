import { bufferGraphql } from "@/lib/buffer/client";
import type { CreatePostMode, CreatePostResult } from "@/lib/buffer/types";

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
          text
          status
          channelId
          dueAt
        }
      }
      ... on MutationError {
        message
      }
    }
  }
`;

type CreatePostInput = {
  text: string;
  channelId: string;
  schedulingType: "automatic" | "notification";
  mode: CreatePostMode;
  dueAt?: string;
  metadata?: {
    twitter?: {
      thread: { text: string }[];
    };
  };
};

export async function createBufferPost(
  apiKey: string,
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const data = await bufferGraphql<{
    createPost:
      | { post: { id: string; text: string; status: string } }
      | { message: string };
  }>(apiKey, CREATE_POST_MUTATION, { input });

  const result = data.createPost;
  if ("message" in result) {
    return { ok: false, message: result.message };
  }

  return { ok: true, post: result.post };
}
