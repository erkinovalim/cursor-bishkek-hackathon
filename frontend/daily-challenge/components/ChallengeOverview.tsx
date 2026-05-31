"use client";

import Link from "next/link";
import { useChallenge } from "@/context/ChallengeContext";

const LINKS = [
  {
    href: "/quest",
    label: "Quest steps",
    description: "View and complete today's challenges",
    badge: "badge-lavender" as const,
  },
  {
    href: "/chat",
    label: "Proof chat",
    description: "Submit proof and get verified by AI",
    badge: "badge-sky" as const,
  },
  {
    href: "/leaderboard",
    label: "Rankings",
    description: "See who's leading the board",
    badge: "badge-mint" as const,
  },
  {
    href: "/certificates",
    label: "Awards",
    description: "End-of-day certificates for winners",
    badge: "badge-peach" as const,
  },
] as const;

export function ChallengeOverview() {
  const { challenge, participant } = useChallenge();

  if (!challenge) return null;

  const totalSteps = challenge.steps.length;
  const completedSteps = participant?.completedStepIds.length ?? 0;
  const totalPoints = challenge.steps.reduce((sum, s) => sum + s.points, 0);

  return (
    <section className="space-y-8">
      <div className="card-float-lg px-8 py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-pill badge-lavender">AI Generated</span>
          <span className="badge-pill badge-neutral">{challenge.theme}</span>
        </div>
        <h3 className="font-serif mt-5 text-3xl font-semibold tracking-tight text-[#1a1a1a]">
          {challenge.title}
        </h3>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-500">
          {challenge.description}
        </p>
        <dl className="mt-8 flex flex-wrap gap-8">
          <div>
            <dt className="text-xs font-medium text-neutral-400">Steps</dt>
            <dd className="font-serif mt-1 text-2xl text-[#1a1a1a]">{totalSteps}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400">Max points</dt>
            <dd className="font-serif mt-1 text-2xl text-[#1a1a1a]">{totalPoints}</dd>
          </div>
          {participant && (
            <div>
              <dt className="text-xs font-medium text-neutral-400">Your progress</dt>
              <dd className="font-serif mt-1 text-2xl text-[#1a1a1a]">
                {completedSteps}/{totalSteps}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map(({ href, label, description, badge }) => (
          <Link
            key={href}
            href={href}
            className="card-float group px-6 py-5 transition hover:shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
          >
            <span className={`badge-pill ${badge}`}>{label}</span>
            <p className="mt-3 text-sm text-neutral-500">{description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-neutral-400 transition group-hover:text-[#1a1a1a]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
