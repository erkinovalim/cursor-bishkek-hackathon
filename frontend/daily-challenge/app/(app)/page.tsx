import { JoinBanner } from "@/components/JoinBanner";
import { ChallengeOverview } from "@/components/ChallengeOverview";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="pb-2 pt-4 text-center">
        <span className="badge-pill badge-mint">Daily Challenge</span>
        <h1 className="font-serif mx-auto mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-[#1a1a1a] sm:text-5xl">
          Complete quests, earn points, win the day
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-neutral-500">
          AI-generated steps, proof chat, live rankings, and end-of-day certificates.
        </p>
      </header>

      <JoinBanner />
      <ChallengeOverview />
    </div>
  );
}
