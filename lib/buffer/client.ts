const BUFFER_API_URL = "https://api.buffer.com";

export class BufferApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "BufferApiError";
  }
}

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function bufferGraphql<T>(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(BUFFER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (payload.errors?.length) {
    throw new BufferApiError(
      payload.errors.map((e) => e.message).join("; "),
      response.status,
      payload.errors,
    );
  }

  if (!response.ok) {
    throw new BufferApiError(
      `Buffer API request failed (${response.status})`,
      response.status,
      payload,
    );
  }

  if (!payload.data) {
    throw new BufferApiError("Buffer API returned no data");
  }

  return payload.data;
}
