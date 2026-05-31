"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiClient } from "@/lib/api";
import type {
  Certificate,
  ChatMessage,
  DailyChallenge,
  LeaderboardEntry,
  Participant,
} from "@/lib/types";

interface ChallengeContextValue {
  challenge: DailyChallenge | null;
  participant: Participant | null;
  leaderboard: LeaderboardEntry[];
  chat: ChatMessage[];
  certificates: Certificate[];
  selectedStepId: string | null;
  loading: boolean;
  error: string | null;
  isFinalized: boolean;
  setSelectedStepId: (stepId: string | null) => void;
  joinQuest: (displayName: string) => Promise<void>;
  submitProof: (message: string) => Promise<void>;
  finalizeDay: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const api = useMemo(() => getApiClient(), []);

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  const refreshLeaderboard = useCallback(async () => {
    if (!challenge) return;
    const entries = await api.getLeaderboard(challenge.id);
    setLeaderboard(entries);
  }, [api, challenge]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setError(null);
        const c = await api.getTodayChallenge();
        if (cancelled) return;
        setChallenge(c);
        setSelectedStepId(c.steps[0]?.id ?? null);

        const [entries, messages] = await Promise.all([
          api.getLeaderboard(c.id),
          api.getChat(c.id),
        ]);
        if (cancelled) return;
        setLeaderboard(entries);
        setChat(messages);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load challenge");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const joinQuest = useCallback(
    async (displayName: string) => {
      if (!challenge) return;
      setError(null);
      try {
        const res = await api.joinChallenge(challenge.id, { displayName });
        setParticipant(res.participant);
        await refreshLeaderboard();
        const messages = await api.getChat(challenge.id);
        setChat(messages);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join quest");
      }
    },
    [api, challenge, refreshLeaderboard],
  );

  const submitProof = useCallback(
    async (message: string) => {
      if (!challenge || !participant || !selectedStepId) return;
      setError(null);
      try {
        const res = await api.submitProof(challenge.id, participant.id, {
          stepId: selectedStepId,
          message,
        });
        setParticipant(res.participant);
        setChat((prev) => [...prev, res.message, res.assistantReply]);
        await refreshLeaderboard();

        const nextStep = challenge.steps.find(
          (s) => !res.participant.completedStepIds.includes(s.id),
        );
        if (nextStep) setSelectedStepId(nextStep.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit proof");
      }
    },
    [api, challenge, participant, selectedStepId, refreshLeaderboard],
  );

  const finalizeDay = useCallback(async () => {
    if (!challenge) return;
    setError(null);
    try {
      const certs = await api.finalizeChallenge(challenge.id);
      setCertificates(certs);
      setIsFinalized(true);
      const messages = await api.getChat(challenge.id);
      setChat(messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize day");
    }
  }, [api, challenge]);

  const value: ChallengeContextValue = {
    challenge,
    participant,
    leaderboard,
    chat,
    certificates,
    selectedStepId,
    loading,
    error,
    isFinalized,
    setSelectedStepId,
    joinQuest,
    submitProof,
    finalizeDay,
    refreshLeaderboard,
  };

  return (
    <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error("useChallenge must be used within ChallengeProvider");
  return ctx;
}
