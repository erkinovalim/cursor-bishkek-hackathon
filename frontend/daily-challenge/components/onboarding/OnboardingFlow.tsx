"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GradientShader } from "./GradientShader";

type Step = "name" | "credentials";

const STEPS: Step[] = ["name", "credentials"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm text-[#1a1a1a]">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-full border border-[#1a1a1a] bg-white px-5 py-3.5 text-[#1a1a1a] outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-200";

export function OnboardingFlow() {
  const { completeRegistration } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[stepIndex];

  function validateCurrent(): string | null {
    if (step === "name" && name.trim().length < 2) {
      return "Please enter at least 2 characters.";
    }
    if (step === "credentials") {
      if (!isValidEmail(email.trim())) {
        return "Please enter a valid email address.";
      }
      if (password.length < 6) {
        return "Password must be at least 6 characters.";
      }
    }
    return null;
  }

  async function handleNext() {
    const err = validateCurrent();
    if (err) {
      setError(err);
      return;
    }

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      setError(null);
      return;
    }

    setSubmitting(true);
    completeRegistration({ name: name.trim(), email: email.trim(), password });
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setError(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && step === "name") {
      e.preventDefault();
      void handleNext();
    }
  }

  const canSubmit =
    step === "name"
      ? name.trim().length >= 2
      : isValidEmail(email.trim()) && password.length >= 6;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gradient-to-br from-orange-600 via-amber-400 to-yellow-300"
        aria-hidden
      />
      <GradientShader />

      <div className="relative flex min-h-full items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px] rounded-[2rem] bg-white px-10 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
          <h1 className="text-center text-[2rem] font-semibold leading-tight tracking-tight text-[#1a1a1a]">
            {step === "name" ? "Welcome" : "Sign up"}
          </h1>

          {step === "name" ? (
            <>
              <p className="mt-3 text-center text-sm leading-relaxed text-neutral-500">
                Complete a daily quest every day.
              </p>
              <p className="mt-6 text-center text-sm text-[#1a1a1a]">
                What&apos;s your name?
              </p>
            </>
          ) : (
            <p className="mt-2 text-center text-sm text-neutral-500">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
          )}

          <div className="mt-10 space-y-5">
            {step === "name" ? (
              <div>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Your name"
                  autoFocus
                  className={inputClass}
                />
              </div>
            ) : (
              <>
                <div>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="Email"
                    autoFocus
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="password">Create password</FieldLabel>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Create password"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={!canSubmit || submitting}
              className="mt-2 w-full rounded-full bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {submitting
                ? "Creating account..."
                : stepIndex === STEPS.length - 1
                  ? "Create account"
                  : "Continue"}
            </button>
          </div>

          {stepIndex > 0 && (
            <p className="mt-8 text-center text-sm text-neutral-500">
              <button
                type="button"
                onClick={handleBack}
                className="text-[#1a1a1a] underline underline-offset-2 hover:text-neutral-600"
              >
                Back
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
