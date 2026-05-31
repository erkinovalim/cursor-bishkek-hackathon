"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChallengeProvider, useChallenge } from "@/context/ChallengeContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AutoJoinQuest } from "@/components/AutoJoinQuest";
import { ProfileTab } from "@/components/ProfileTab";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { config } from "@/lib/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/quest", label: "Quest" },
  { href: "/chat", label: "Chat" },
  { href: "/leaderboard", label: "Rankings" },
  { href: "/certificates", label: "Awards" },
] as const;

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { challenge, loading, error } = useChallenge();

  if (loading) {
    return (
      <div className="dot-grid flex flex-1 items-center justify-center py-32">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800" />
          <p className="mt-5 text-sm text-neutral-500">Loading today&apos;s quest…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dot-grid flex min-h-full flex-col">
      <AutoJoinQuest />
      <ProfileTab />

      <header className="sticky top-0 z-10 bg-[#f9f9f9]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="group shrink-0">
            <span className="font-serif text-lg font-semibold tracking-tight text-[#1a1a1a] transition group-hover:text-neutral-600">
              Quest Board
            </span>
          </Link>

          <nav className="nav-segment max-w-full overflow-x-auto">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-segment-link shrink-0 ${active ? "nav-segment-link-active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {challenge && <CountdownTimer endsAt={challenge.endsAt} />}
            {config.useMock && (
              <span className="badge-pill badge-neutral hidden text-[11px] lg:inline-flex">
                Demo
              </span>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto w-full max-w-3xl px-6 pt-2">
          <div className="badge-pill badge-peach w-full justify-center py-3 text-sm">
            {error}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 pb-20">{children}</main>
    </div>
  );
}

function AppGate({ children }: { children: React.ReactNode }) {
  const { isOnboarded, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  return (
    <ChallengeProvider>
      <AppShellInner>{children}</AppShellInner>
    </ChallengeProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppGate>{children}</AppGate>;
}
