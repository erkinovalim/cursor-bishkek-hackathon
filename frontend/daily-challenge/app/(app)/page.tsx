import { JoinBanner } from "@/components/JoinBanner";
import { HomeHero } from "@/components/HomeHero";
import { ChallengeOverview } from "@/components/ChallengeOverview";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <HomeHero />
      <JoinBanner />
      <ChallengeOverview />
    </div>
  );
}
