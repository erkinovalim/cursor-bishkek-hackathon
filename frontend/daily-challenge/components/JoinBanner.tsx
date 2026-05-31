"use client";

import { useChallenge } from "@/context/ChallengeContext";
import { useAuth } from "@/context/AuthContext";

export function JoinBanner() {
  const { user } = useAuth();
  const { participant } = useChallenge();

  if (participant) {
    return (
      <div className="card-float flex items-center justify-between gap-6 px-7 py-6">
        <div>
          <span className="badge-pill badge-mint">Active</span>
          <p className="font-serif mt-3 text-2xl font-medium text-[#1a1a1a]">
            {participant.displayName}
          </p>
          {user && (
            <p className="mt-1 text-xs text-neutral-400">{user.email}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-neutral-400">Points</p>
          <p className="font-serif mt-1 text-4xl tabular-nums text-[#1a1a1a]">
            {participant.points}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-float-lg px-8 py-8 text-center">
      <span className="badge-pill badge-lavender">Joining quest</span>
      <p className="mt-4 text-sm text-neutral-500">Setting up your quest profile…</p>
    </div>
  );
}
