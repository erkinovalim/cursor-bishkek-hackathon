"use client";

import { useAuth } from "@/context/AuthContext";
import { useChallenge } from "@/context/ChallengeContext";

export function ProfileTab() {
  const { user } = useAuth();
  const { participant, challenge, leaderboard } = useChallenge();

  if (!user) return null;

  const rank = participant
    ? leaderboard.find((e) => e.participant.id === participant.id)?.rank
    : undefined;
  const totalSteps = challenge?.steps.length ?? 0;
  const completedSteps = participant?.completedStepIds.length ?? 0;
  const points = participant?.points ?? 0;

  return (
    <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 md:block">
      <div className="card-float w-56 rounded-2xl px-5 py-5">
        {!participant ? (
          <p className="text-sm text-neutral-500">Joining quest…</p>
        ) : (
          <dl className="space-y-4">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                Name
              </dt>
              <dd className="font-serif mt-0.5 text-base text-[#1a1a1a]">{user.name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                Email
              </dt>
              <dd className="mt-0.5 truncate text-sm text-neutral-600">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                Points
              </dt>
              <dd className="font-serif mt-0.5 text-2xl tabular-nums text-[#1a1a1a]">
                {points}
              </dd>
            </div>
            {totalSteps > 0 && (
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  Progress
                </dt>
                <dd className="mt-0.5 text-sm text-neutral-600">
                  {completedSteps}/{totalSteps} steps
                </dd>
              </div>
            )}
            {rank != null && (
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                  Rank
                </dt>
                <dd className="font-serif mt-0.5 text-lg text-[#1a1a1a]">#{rank}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
