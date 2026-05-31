import type {
  Certificate,
  DailyChallenge,
  JoinChallengeRequest,
  JoinChallengeResponse,
  LeaderboardEntry,
  ChatMessage,
  ProofSubmission,
  SubmitProofResponse,
} from "../types";

/**
 * API contract aligned with expected FastAPI routes:
 *
 * GET  /api/v1/challenges/today
 * POST /api/v1/challenges/{challenge_id}/join
 * GET  /api/v1/challenges/{challenge_id}/leaderboard
 * GET  /api/v1/challenges/{challenge_id}/chat
 * POST /api/v1/challenges/{challenge_id}/proof
 * POST /api/v1/challenges/{challenge_id}/finalize
 * GET  /api/v1/challenges/{challenge_id}/certificates
 */
export interface ChallengeApiClient {
  getTodayChallenge(): Promise<DailyChallenge>;
  joinChallenge(
    challengeId: string,
    body: JoinChallengeRequest,
  ): Promise<JoinChallengeResponse>;
  getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]>;
  getChat(challengeId: string): Promise<ChatMessage[]>;
  submitProof(
    challengeId: string,
    participantId: string,
    body: ProofSubmission,
  ): Promise<SubmitProofResponse>;
  finalizeChallenge(challengeId: string): Promise<Certificate[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** HTTP client for FastAPI — swap in when NEXT_PUBLIC_API_URL is set. */
export class HttpChallengeApiClient implements ChallengeApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, detail || `Request failed (${res.status})`);
    }

    return res.json() as Promise<T>;
  }

  getTodayChallenge() {
    return this.request<DailyChallenge>("/api/v1/challenges/today");
  }

  joinChallenge(challengeId: string, body: JoinChallengeRequest) {
    return this.request<JoinChallengeResponse>(
      `/api/v1/challenges/${challengeId}/join`,
      { method: "POST", body: JSON.stringify(body) },
    );
  }

  getLeaderboard(challengeId: string) {
    return this.request<LeaderboardEntry[]>(
      `/api/v1/challenges/${challengeId}/leaderboard`,
    );
  }

  getChat(challengeId: string) {
    return this.request<ChatMessage[]>(
      `/api/v1/challenges/${challengeId}/chat`,
    );
  }

  submitProof(
    challengeId: string,
    participantId: string,
    body: ProofSubmission,
  ) {
    return this.request<SubmitProofResponse>(
      `/api/v1/challenges/${challengeId}/proof?participant_id=${participantId}`,
      { method: "POST", body: JSON.stringify(body) },
    );
  }

  finalizeChallenge(challengeId: string) {
    return this.request<Certificate[]>(
      `/api/v1/challenges/${challengeId}/finalize`,
      { method: "POST" },
    );
  }
}
