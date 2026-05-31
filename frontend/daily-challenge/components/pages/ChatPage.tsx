"use client";

import { PageHeader } from "@/components/PageHeader";
import { ProofChat } from "@/components/ProofChat";

export function ChatPage() {
  return (
    <>
      <PageHeader
        title="Proof chat"
        description="Share evidence that you completed a step. The AI moderator reviews your submission and awards points."
      />
      <ProofChat />
    </>
  );
}
