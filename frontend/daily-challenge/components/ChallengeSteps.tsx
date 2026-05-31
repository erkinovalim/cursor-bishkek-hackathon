"use client";

import { useState } from "react";
import { useChallenge } from "@/context/ChallengeContext";

function StepBadge({
  completed,
  locked,
}: {
  completed: boolean;
  locked: boolean;
}) {
  if (completed) {
    return <span className="badge-pill badge-mint">Done</span>;
  }
  if (locked) {
    return <span className="badge-pill badge-neutral">Locked</span>;
  }
  return <span className="badge-pill badge-sky">Available</span>;
}

export function ChallengeSteps() {
  const {
    challenge,
    participant,
    selectedStepId,
    setSelectedStepId,
    completeStep,
    completingStepId,
  } = useChallenge();
  const [proofByStep, setProofByStep] = useState<Record<string, string>>({});

  if (!challenge) return null;

  const completedIds = new Set(participant?.completedStepIds ?? []);

  function updateProof(stepId: string, value: string) {
    setProofByStep((prev) => ({ ...prev, [stepId]: value }));
  }

  async function handleComplete(stepId: string) {
    const proof = proofByStep[stepId]?.trim() ?? "";
    if (!proof) return;
    await completeStep(stepId, proof);
    setProofByStep((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
  }

  return (
    <ol className="space-y-4">
      {challenge.steps.map((step, index) => {
        const completed = completedIds.has(step.id);
        const prevCompleted =
          index === 0 || completedIds.has(challenge.steps[index - 1].id);
        const locked = !!participant && !prevCompleted && !completed;
        const selected = selectedStepId === step.id;
        const isCompleting = completingStepId === step.id;
        const proof = proofByStep[step.id] ?? "";

        return (
          <li key={step.id}>
            <div
              className={`card-float overflow-hidden transition ${
                selected
                  ? "ring-2 ring-neutral-900/10 shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
                  : ""
              } ${locked ? "opacity-45" : ""}`}
            >
              <button
                type="button"
                disabled={!participant || locked}
                onClick={() => setSelectedStepId(step.id)}
                className={`w-full p-6 text-left ${locked ? "cursor-not-allowed" : ""} ${!participant ? "cursor-default" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-medium ${
                        completed
                          ? "bg-[#1a1a1a] text-white"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {completed ? "✓" : step.order}
                    </span>
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{step.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StepBadge completed={completed} locked={locked} />
                    <span className="text-xs font-medium text-neutral-400">
                      +{step.points} pts
                    </span>
                  </div>
                </div>
              </button>

              {participant && selected && !completed && !locked && (
                <div className="border-t border-neutral-100 px-6 pb-6 pt-4">
                  <label
                    htmlFor={`proof-${step.id}`}
                    className="mb-2 block text-sm text-[#1a1a1a]"
                  >
                    Proof
                  </label>
                  <textarea
                    id={`proof-${step.id}`}
                    value={proof}
                    onChange={(e) => updateProof(step.id, e.target.value)}
                    placeholder="Describe what you did or paste a link…"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-[#1a1a1a] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200"
                  />
                  <button
                    type="button"
                    onClick={() => void handleComplete(step.id)}
                    disabled={!proof.trim() || isCompleting}
                    className="btn-pill mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isCompleting ? "Verifying…" : `Complete step · +${step.points} pts`}
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
