"use client";

import { useChallenge } from "@/context/ChallengeContext";

export function LeaderboardPanel() {
  const { leaderboard, participant } = useChallenge();

  if (leaderboard.length === 0) {
    return (
      <div className="card-float py-20 text-center text-sm text-neutral-400">
        No participants yet
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {leaderboard.map((entry) => {
        const isYou = participant?.id === entry.participant.id;
        return (
          <li
            key={entry.participant.id}
            className={`card-float flex items-center gap-4 px-5 py-4 ${
              isYou ? "ring-2 ring-emerald-100" : ""
            }`}
          >
            <span className="font-serif flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-lg text-[#1a1a1a]">
              {entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-[#1a1a1a]">
                  {entry.participant.displayName}
                </p>
                {isYou && <span className="badge-pill badge-mint text-[10px]">You</span>}
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                {entry.participant.completedStepIds.length} steps completed
              </p>
            </div>
            <span className="font-serif text-2xl tabular-nums text-[#1a1a1a]">
              {entry.participant.points}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
