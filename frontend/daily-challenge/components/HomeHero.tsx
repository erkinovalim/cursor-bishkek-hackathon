"use client";

import { useChallenge } from "@/context/ChallengeContext";

export function HomeHero() {
  const { challenge } = useChallenge();

  if (!challenge) return null;

  return (
    <header className="pb-2 pt-4 text-center">
      <span className="badge-pill badge-mint">Daily Challenge</span>
      <h1 className="font-serif mx-auto mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-[#1a1a1a] sm:text-5xl">
        {challenge.title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-neutral-500">
        {challenge.description}
      </p>
    </header>
  );
}
