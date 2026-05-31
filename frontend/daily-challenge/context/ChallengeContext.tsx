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
  DailyChallenge,
  LeaderboardEntry,
  Participant,
} from "@/lib/types";

interface ChallengeContextValue {
  challenge: DailyChallenge | null;
  participant: Participant | null;
  leaderboard: LeaderboardEntry[];
  certificates: Certificate[];
  selectedStepId: string | null;
  loading: boolean;
  error: string | null;
  isFinalized: boolean;
  completingStepId: string | null;
  setSelectedStepId: (stepId: string | null) => void;
  joinQuest: (displayName: string) => Promise<void>;
  completeStep: (stepId: string, proof: string) => Promise<void>;
  finalizeDay: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const api = useMemo(() => getApiClient(), []);

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
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

        const entries = await api.getLeaderboard(c.id);
        if (cancelled) return;
        setLeaderboard(entries);
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join quest");
      }
    },
    [api, challenge, refreshLeaderboard],
  );

  const completeStep = useCallback(
    async (stepId: string, proof: string) => {
      if (!challenge || !participant) return;
      setError(null);
      setCompletingStepId(stepId);
      try {
        const res = await api.completeStep(challenge.id, participant.id, {
          stepId,
          message: proof,
        });
        setParticipant(res.participant);
        await refreshLeaderboard();

        const nextStep = challenge.steps.find(
          (s) => !res.participant.completedStepIds.includes(s.id),
        );
        if (nextStep) setSelectedStepId(nextStep.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to complete step");
      } finally {
        setCompletingStepId(null);
      }
    },
    [api, challenge, participant, refreshLeaderboard],
  );

  const finalizeDay = useCallback(async () => {
    if (!challenge) return;
    setError(null);
    try {
      const certs = await api.finalizeChallenge(challenge.id);
      setCertificates(certs);
      setIsFinalized(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finalize day");
    }
  }, [api, challenge]);

  const value: ChallengeContextValue = {
    challenge,
    participant,
    leaderboard,
    certificates,
    selectedStepId,
    loading,
    error,
    isFinalized,
    completingStepId,
    setSelectedStepId,
    joinQuest,
    completeStep,
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
