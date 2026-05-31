"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChallenge } from "@/context/ChallengeContext";

export function ProofChat() {
  const { challenge, participant, chat, selectedStepId, submitProof } = useChallenge();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedStep = challenge?.steps.find((s) => s.id === selectedStepId);
  const alreadyCompleted = participant?.completedStepIds.includes(selectedStepId ?? "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !participant || alreadyCompleted) return;
    setSubmitting(true);
    await submitProof(message.trim());
    setMessage("");
    setSubmitting(false);
  }

  return (
    <section className="card-float-lg flex min-h-[520px] flex-col overflow-hidden">
      {participant && selectedStep && (
        <div className="border-b border-neutral-100 px-6 py-4">
          <span className="badge-pill badge-lavender">Current step</span>
          <p className="mt-2 text-sm font-medium text-[#1a1a1a]">{selectedStep.title}</p>
          {!alreadyCompleted && (
            <Link
              href="/quest"
              className="mt-2 inline-block text-xs text-neutral-400 transition hover:text-[#1a1a1a]"
            >
              Change step →
            </Link>
          )}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {chat.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-400">No messages yet</p>
        ) : (
          chat.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-3xl rounded-br-lg bg-[#1a1a1a] px-5 py-3 text-white"
                    : msg.role === "assistant"
                      ? "card-float rounded-3xl rounded-bl-lg px-5 py-3 text-neutral-700"
                      : "w-full px-4 py-2 text-center text-xs text-neutral-400"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="mb-1.5 text-[11px] font-medium text-violet-600">AI Moderator</p>
                )}
                {msg.role === "user" && msg.participantId && (
                  <p className="mb-1.5 text-[11px] font-medium text-neutral-400">Your proof</p>
                )}
                <p className={msg.role === "user" ? "text-neutral-100" : ""}>{msg.content}</p>
                {msg.pointsAwarded != null && (
                  <p
                    className={`mt-2 text-xs font-medium ${msg.role === "user" ? "text-emerald-300" : "text-emerald-600"}`}
                  >
                    +{msg.pointsAwarded} points
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-neutral-100 bg-white/80 p-5">
        {!participant ? (
          <p className="text-center text-sm text-neutral-500">
            <Link href="/" className="font-medium text-[#1a1a1a] underline underline-offset-2">
              Join the quest
            </Link>{" "}
            to submit proof.
          </p>
        ) : !selectedStepId ? (
          <p className="text-center text-sm text-neutral-500">
            <Link href="/quest" className="font-medium text-[#1a1a1a] underline underline-offset-2">
              Select a step
            </Link>{" "}
            first.
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={alreadyCompleted || submitting}
              placeholder={
                alreadyCompleted ? "Step already completed" : "Describe your proof…"
              }
              className="input-pill flex-1"
            />
            <button
              type="submit"
              disabled={alreadyCompleted || submitting || !message.trim()}
              className="btn-pill shrink-0"
            >
              {submitting ? "…" : "Send"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
