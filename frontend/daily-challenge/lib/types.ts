/** Domain types shared with the FastAPI backend (mirror Pydantic models). */

export type StepStatus = "locked" | "available" | "pending_review" | "completed";

export interface ChallengeStep {
  id: string;
  order: number;
  title: string;
  description: string;
  points: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  theme: string;
  description: string;
  generatedAt: string;
  endsAt: string;
  steps: ChallengeStep[];
}

export interface Participant {
  id: string;
  displayName: string;
  points: number;
  completedStepIds: string[];
  joinedAt: string;
}

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  stepId?: string;
  participantId?: string;
  createdAt: string;
  pointsAwarded?: number;
}

export interface ProofSubmission {
  stepId: string;
  message: string;
}

export interface Certificate {
  id: string;
  participantId: string;
  participantName: string;
  rank: number;
  totalPoints: number;
  challengeTitle: string;
  issuedAt: string;
  /** AI-generated congratulatory text */
  body: string;
}

export interface LeaderboardEntry {
  rank: number;
  participant: Participant;
}

export interface JoinChallengeRequest {
  displayName: string;
}

export interface JoinChallengeResponse {
  participant: Participant;
  challenge: DailyChallenge;
}

export interface SubmitProofResponse {
  message: ChatMessage;
  assistantReply: ChatMessage;
  participant: Participant;
  stepCompleted: boolean;
}
