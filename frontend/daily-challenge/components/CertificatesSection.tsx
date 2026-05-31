"use client";

import { useState } from "react";
import { useChallenge } from "@/context/ChallengeContext";
import type { Certificate } from "@/lib/types";

function CertificateCard({ cert }: { cert: Certificate }) {
  const rankLabels = ["Champion", "Runner-up", "Third place"];

  return (
    <article className="card-float-lg px-10 py-10 text-center">
      <span className="badge-pill badge-peach">Certificate</span>
      <p className="mt-4 text-sm text-neutral-500">
        {rankLabels[cert.rank - 1] ?? `Rank #${cert.rank}`}
      </p>
      <h3 className="font-serif mt-5 text-3xl font-semibold tracking-tight text-[#1a1a1a]">
        {cert.participantName}
      </h3>
      <div className="mx-auto my-7 h-px w-16 bg-neutral-200" />
      <p className="text-[15px] leading-relaxed text-neutral-600">{cert.body}</p>
      <div className="mt-8 flex items-center justify-center gap-3 text-xs text-neutral-400">
        <span>{cert.totalPoints} points</span>
        <span>·</span>
        <span>{cert.challengeTitle}</span>
      </div>
    </article>
  );
}

export function CertificatesSection() {
  const { certificates, isFinalized, participant, finalizeDay } = useChallenge();
  const [finalizing, setFinalizing] = useState(false);

  const yourCert = certificates.find((c) => c.participantId === participant?.id);

  async function handleFinalize() {
    setFinalizing(true);
    await finalizeDay();
    setFinalizing(false);
  }

  if (!isFinalized && certificates.length === 0) {
    return (
      <div className="card-float border-dashed px-8 py-16 text-center">
        <span className="badge-pill badge-lavender">End of day</span>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
          Certificates are issued when the day ends. Use the button below to preview in demo mode.
        </p>
        <button
          type="button"
          onClick={handleFinalize}
          disabled={finalizing}
          className="btn-pill mt-8"
        >
          {finalizing ? "Generating…" : "Simulate end of day"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {yourCert && (
        <div>
          <p className="mb-4 text-xs font-medium text-neutral-400">Your certificate</p>
          <CertificateCard cert={yourCert} />
        </div>
      )}

      {certificates.filter((c) => c.participantId !== participant?.id).length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-neutral-400">
            {yourCert ? "Other winners" : "Winners"}
          </p>
          {certificates
            .filter((c) => c.participantId !== participant?.id)
            .map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
        </div>
      )}
    </div>
  );
}
