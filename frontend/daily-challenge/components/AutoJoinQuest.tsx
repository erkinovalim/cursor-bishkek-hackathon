"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChallenge } from "@/context/ChallengeContext";

/** Auto-joins the daily quest after onboarding using the registered name. */
export function AutoJoinQuest() {
  const { user } = useAuth();
  const { participant, joinQuest, challenge, loading } = useChallenge();

  useEffect(() => {
    if (!user || !challenge || loading || participant) return;
    void joinQuest(user.name);
  }, [user, challenge, loading, participant, joinQuest]);

  return null;
}
