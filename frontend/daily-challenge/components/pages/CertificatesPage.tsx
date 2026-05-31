"use client";

import { PageHeader } from "@/components/PageHeader";
import { CertificatesSection } from "@/components/CertificatesSection";

export function CertificatesPage() {
  return (
    <>
      <PageHeader
        title="Awards"
        description="At the end of each day, top performers receive AI-generated certificates."
      />
      <CertificatesSection />
    </>
  );
}
