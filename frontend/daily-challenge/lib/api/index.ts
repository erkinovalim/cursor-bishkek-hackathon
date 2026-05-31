import { config } from "../config";
import { HttpChallengeApiClient } from "./client";
import type { ChallengeApiClient } from "./client";
import { getMockClient } from "./mock-client";

let client: ChallengeApiClient | null = null;

export function getApiClient(): ChallengeApiClient {
  if (!client) {
    client = config.useMock
      ? getMockClient()
      : new HttpChallengeApiClient(config.apiUrl);
  }
  return client;
}

export type { ChallengeApiClient } from "./client";
export { ApiError } from "./client";
