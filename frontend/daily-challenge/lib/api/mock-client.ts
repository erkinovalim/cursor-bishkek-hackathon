import type { ChallengeApiClient } from "./client";
import type {
  Certificate,
  ChatMessage,
  DailyChallenge,
  JoinChallengeRequest,
  JoinChallengeResponse,
  LeaderboardEntry,
  Participant,
  ProofSubmission,
  SubmitProofResponse,
} from "../types";

function id() {
  return crypto.randomUUID();
}

function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const MOCK_CHALLENGE: DailyChallenge = {
  id: "challenge-2026-05-31",
  title: "Bishkek Explorer Quest",
  theme: "Urban Adventure",
  description:
    "An AI-crafted daily quest to discover hidden gems, connect with locals, and push your limits across the city. Complete each step and share proof in the chat to earn points.",
  generatedAt: new Date().toISOString(),
  endsAt: endOfToday(),
  steps: [
    {
      id: "step-1",
      order: 1,
      title: "Morning Coffee Scout",
      description:
        "Find a local café you've never visited. Order something new and snap a photo of your drink with the shop name visible.",
      points: 25,
    },
    {
      id: "step-2",
      order: 2,
      title: "Kindness Relay",
      description:
        "Perform one small act of kindness for a stranger — hold a door, help carry bags, or share directions.",
      points: 35,
    },
    {
      id: "step-3",
      order: 3,
      title: "Hidden Landmark",
      description:
        "Visit a lesser-known landmark or mural in your neighborhood and describe what makes it special.",
      points: 40,
    },
    {
      id: "step-4",
      order: 4,
      title: "Team Sync",
      description:
        "Connect with another quest participant (in person or online) and collaborate on a 30-second creative video about Bishkek.",
      points: 50,
    },
    {
      id: "step-5",
      order: 5,
      title: "Sunset Reflection",
      description:
        "Watch the sunset from a rooftop or hill. Write three sentences about what you're grateful for today.",
      points: 30,
    },
  ],
};

const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: "p-1",
    displayName: "Aida",
    points: 60,
    completedStepIds: ["step-1", "step-2"],
    joinedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "p-2",
    displayName: "Bek",
    points: 25,
    completedStepIds: ["step-1"],
    joinedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "p-3",
    displayName: "Cholpon",
    points: 95,
    completedStepIds: ["step-1", "step-2", "step-3"],
    joinedAt: new Date(Date.now() - 5400000).toISOString(),
  },
];

const MOCK_CHAT: ChatMessage[] = [
  {
    id: "m-1",
    role: "system",
    content:
      "Welcome to today's quest! Submit proof for each step here. An AI moderator will review your submissions.",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "m-2",
    role: "user",
    content:
      "Step 1 proof: Got an Americano at Sierra Coffee on Erkindik — never been before, loved the vibe!",
    stepId: "step-1",
    participantId: "p-1",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "m-3",
    role: "assistant",
    content:
      "Verified! Your coffee scout mission checks out — +25 points. Step 2 is now unlocked for you.",
    stepId: "step-1",
    participantId: "p-1",
    createdAt: new Date(Date.now() - 5390000).toISOString(),
    pointsAwarded: 25,
  },
];

const CERTIFICATE_TEMPLATES = [
  (name: string, rank: number, pts: number, title: string) =>
    `This certifies that ${name} has demonstrated exceptional spirit as Rank #${rank} in "${title}", earning ${pts} quest points through creativity, courage, and community.`,
  (name: string, rank: number, pts: number, title: string) =>
    `${name} is hereby recognized as a Legend of the Day (Rank ${rank}) for outstanding dedication across every challenge in "${title}" — ${pts} points of pure adventure.`,
];

export class MockChallengeApiClient implements ChallengeApiClient {
  private challenge = structuredClone(MOCK_CHALLENGE);
  private participants = structuredClone(MOCK_PARTICIPANTS);
  private chat = structuredClone(MOCK_CHAT);
  private certificates: Certificate[] = [];
  private finalized = false;

  async getTodayChallenge() {
    await delay(300);
    return structuredClone(this.challenge);
  }

  async joinChallenge(
    _challengeId: string,
    body: JoinChallengeRequest,
  ): Promise<JoinChallengeResponse> {
    await delay(400);
    const existing = this.participants.find(
      (p) => p.displayName.toLowerCase() === body.displayName.toLowerCase(),
    );
    if (existing) {
      return { participant: structuredClone(existing), challenge: structuredClone(this.challenge) };
    }

    const participant: Participant = {
      id: id(),
      displayName: body.displayName.trim(),
      points: 0,
      completedStepIds: [],
      joinedAt: new Date().toISOString(),
    };
    this.participants.push(participant);

    const welcome: ChatMessage = {
      id: id(),
      role: "system",
      content: `${participant.displayName} joined the quest. Good luck, adventurer!`,
      participantId: participant.id,
      createdAt: new Date().toISOString(),
    };
    this.chat.push(welcome);

    return { participant, challenge: structuredClone(this.challenge) };
  }

  async getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    void challengeId;
    await delay(200);
    return this.participants
      .slice()
      .sort((a, b) => b.points - a.points)
      .map((participant, i) => ({ rank: i + 1, participant }));
  }

  async getChat(challengeId: string): Promise<ChatMessage[]> {
    void challengeId;
    await delay(200);
    return structuredClone(this.chat);
  }

  async submitProof(
    _challengeId: string,
    participantId: string,
    body: ProofSubmission,
  ): Promise<SubmitProofResponse> {
    await delay(800);

    const participant = this.participants.find((p) => p.id === participantId);
    if (!participant) throw new Error("Participant not found");

    const step = this.challenge.steps.find((s) => s.id === body.stepId);
    if (!step) throw new Error("Step not found");

    if (participant.completedStepIds.includes(body.stepId)) {
      throw new Error("Step already completed");
    }

    const userMessage: ChatMessage = {
      id: id(),
      role: "user",
      content: body.message.trim(),
      stepId: body.stepId,
      participantId,
      createdAt: new Date().toISOString(),
    };
    this.chat.push(userMessage);

    participant.completedStepIds.push(body.stepId);
    participant.points += step.points;

    const assistantReply: ChatMessage = {
      id: id(),
      role: "assistant",
      content: `Proof accepted for "${step.title}"! Great work — +${step.points} points. ${
        participant.completedStepIds.length < this.challenge.steps.length
          ? "Your next step awaits."
          : "You've completed the entire quest!"
      }`,
      stepId: body.stepId,
      participantId,
      createdAt: new Date().toISOString(),
      pointsAwarded: step.points,
    };
    this.chat.push(assistantReply);

    return {
      message: userMessage,
      assistantReply,
      participant: structuredClone(participant),
      stepCompleted: true,
    };
  }

  async finalizeChallenge(challengeId: string): Promise<Certificate[]> {
    void challengeId;
    await delay(600);
    if (this.finalized) return structuredClone(this.certificates);

    this.finalized = true;
    const top = this.participants
      .slice()
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    this.certificates = top.map((p, i) => {
      const template = CERTIFICATE_TEMPLATES[i % CERTIFICATE_TEMPLATES.length];
      return {
        id: id(),
        participantId: p.id,
        participantName: p.displayName,
        rank: i + 1,
        totalPoints: p.points,
        challengeTitle: this.challenge.title,
        issuedAt: new Date().toISOString(),
        body: template(p.displayName, i + 1, p.points, this.challenge.title),
      };
    });

    const announce: ChatMessage = {
      id: id(),
      role: "system",
      content: `Day's end! AI certificates issued to the top ${this.certificates.length} adventurers. 🏆`,
      createdAt: new Date().toISOString(),
    };
    this.chat.push(announce);

    return structuredClone(this.certificates);
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Singleton so mock state persists during the session. */
let mockInstance: MockChallengeApiClient | null = null;

export function getMockClient(): MockChallengeApiClient {
  if (!mockInstance) mockInstance = new MockChallengeApiClient();
  return mockInstance;
}
