"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ChallengeSteps } from "@/components/ChallengeSteps";
import { useChallenge } from "@/context/ChallengeContext";

export function QuestPage() {
  const { participant } = useChallenge();

  return (
    <>
      <PageHeader
        title="Quest steps"
        description="Work through each step in order. Select one, then head to chat to submit your proof."
      />

      {!participant && (
        <div className="card-float mb-8 px-5 py-4 text-sm text-neutral-600">
          You need to{" "}
          <Link href="/" className="font-medium text-[#1a1a1a] underline underline-offset-2">
            join the quest
          </Link>{" "}
          before completing steps.
        </div>
      )}

      <ChallengeSteps />

      {participant && (
        <div className="mt-10 text-center">
          <Link href="/chat" className="btn-pill inline-flex">
            Go to proof chat
          </Link>
        </div>
      )}
    </>
  );
}
