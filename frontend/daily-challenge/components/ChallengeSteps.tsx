"use client";

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
  const { challenge, participant, selectedStepId, setSelectedStepId } = useChallenge();

  if (!challenge) return null;

  const completedIds = new Set(participant?.completedStepIds ?? []);

  return (
    <ol className="space-y-4">
      {challenge.steps.map((step, index) => {
        const completed = completedIds.has(step.id);
        const prevCompleted =
          index === 0 || completedIds.has(challenge.steps[index - 1].id);
        const locked = !!participant && !prevCompleted && !completed;
        const selected = selectedStepId === step.id;

        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!participant || locked}
              onClick={() => setSelectedStepId(step.id)}
              className={`card-float w-full p-6 text-left transition ${
                selected
                  ? "ring-2 ring-neutral-900/10 shadow-[0_4px_32px_rgba(0,0,0,0.08)]"
                  : "hover:shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
              } ${locked ? "cursor-not-allowed opacity-45" : ""} ${!participant ? "cursor-default" : ""}`}
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
          </li>
        );
      })}
    </ol>
  );
}
