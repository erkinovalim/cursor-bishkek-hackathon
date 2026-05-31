"use client";

import { useRef, useState } from "react";
import { useChallenge } from "@/context/ChallengeContext";
import { readImageAsDataUrl, validateProofImage } from "@/lib/proof-image";

interface StepProof {
  message: string;
  imagePreview?: string;
  imageData?: string;
  imageName?: string;
}

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

function hasProof(proof: StepProof | undefined) {
  if (!proof) return false;
  return !!proof.message.trim() || !!proof.imageData;
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
  const [proofByStep, setProofByStep] = useState<Record<string, StepProof>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!challenge) return null;

  const completedIds = new Set(participant?.completedStepIds ?? []);

  function updateMessage(stepId: string, message: string) {
    setProofByStep((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], message },
    }));
  }

  function clearImage(stepId: string) {
    setImageErrors((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
    setProofByStep((prev) => ({
      ...prev,
      [stepId]: {
        message: prev[stepId]?.message ?? "",
        imagePreview: undefined,
        imageData: undefined,
        imageName: undefined,
      },
    }));
    const input = fileInputRefs.current[stepId];
    if (input) input.value = "";
  }

  async function handleImageSelect(stepId: string, file: File | undefined) {
    if (!file) return;
    const err = validateProofImage(file);
    if (err) {
      setImageErrors((prev) => ({ ...prev, [stepId]: err }));
      return;
    }
    setImageErrors((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
    try {
      const imageData = await readImageAsDataUrl(file);
      setProofByStep((prev) => ({
        ...prev,
        [stepId]: {
          message: prev[stepId]?.message ?? "",
          imagePreview: imageData,
          imageData,
          imageName: file.name,
        },
      }));
    } catch {
      setImageErrors((prev) => ({
        ...prev,
        [stepId]: "Could not load that image. Try another file.",
      }));
    }
  }

  async function handleComplete(stepId: string) {
    const proof = proofByStep[stepId];
    if (!hasProof(proof)) return;

    await completeStep(stepId, {
      message: proof.message.trim() || undefined,
      imageData: proof.imageData,
      imageName: proof.imageName,
    });

    setProofByStep((prev) => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
    clearImage(stepId);
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
        const proof = proofByStep[step.id];
        const message = proof?.message ?? "";

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
                  <p className="mb-3 text-sm text-[#1a1a1a]">Proof</p>

                  {proof?.imagePreview ? (
                    <div className="relative mb-3 overflow-hidden rounded-2xl border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proof.imagePreview}
                        alt="Proof preview"
                        className="max-h-48 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => clearImage(step.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white transition hover:bg-black/80"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="mb-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 transition hover:border-neutral-400 hover:bg-neutral-100/80">
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        Upload photo
                      </span>
                      <span className="mt-1 text-xs text-neutral-500">
                        JPEG, PNG, WebP, or GIF · max 5 MB
                      </span>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[step.id] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) =>
                          void handleImageSelect(step.id, e.target.files?.[0])
                        }
                      />
                    </label>
                  )}

                  {imageErrors[step.id] && (
                    <p className="mb-3 text-sm text-red-600">{imageErrors[step.id]}</p>
                  )}

                  <label htmlFor={`proof-${step.id}`} className="mb-2 block text-xs text-neutral-500">
                    Optional caption
                  </label>
                  <textarea
                    id={`proof-${step.id}`}
                    value={message}
                    onChange={(e) => updateMessage(step.id, e.target.value)}
                    placeholder="Add a short note about your proof…"
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-[#1a1a1a] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200"
                  />

                  <button
                    type="button"
                    onClick={() => void handleComplete(step.id)}
                    disabled={!hasProof(proof) || isCompleting}
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
