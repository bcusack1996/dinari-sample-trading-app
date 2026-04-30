import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";
import { StepIndicator } from "@/components/StepIndicator";
import { EntityForm } from "./EntityForm";

export default async function EntityStepPage() {
  const state = await loadOnboardingState();
  if (!state) redirect("/");
  if (state.step !== "entity") redirect(`/onboarding/${state.step}`);

  return (
    <>
      <StepIndicator current="entity" />
      <div className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">
          Create your entity
        </h1>
        <p style={{ color: "var(--color-paper-200)" }}>
          A Dinari <code className="font-mono text-sm">Entity</code> represents
          you as a trader. We&rsquo;ll use your wallet address as the unique
          reference ID.
        </p>
      </div>
      <EntityForm walletAddress={state.address} />
    </>
  );
}
