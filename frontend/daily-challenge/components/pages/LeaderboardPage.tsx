"use client";

import { PageHeader } from "@/components/PageHeader";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";

export function LeaderboardPage() {
  return (
    <>
      <PageHeader
        title="Rankings"
        description="Live standings for today's quest. Complete steps and earn points to climb the board."
      />
      <LeaderboardPanel />
    </>
  );
}
