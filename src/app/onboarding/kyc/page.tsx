import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";
import { StepIndicator } from "@/components/StepIndicator";
import { KycEmbed } from "./KycEmbed";

export default async function KycStepPage() {
  const state = await loadOnboardingState();
  if (!state) redirect("/");
  if (state.step === "entity") redirect("/onboarding/entity");
  if (state.step === "account") redirect("/onboarding/account");
  if (state.step === "done") redirect("/dashboard");

  return (
    <>
      <StepIndicator current="kyc" />
      <div className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">
          Verify your identity
        </h1>
        <p style={{ color: "var(--color-paper-200)" }}>
          Dinari hosts a managed KYC flow. Complete the steps in the panel
          below — once approved, you&rsquo;ll move on to linking your wallet.
        </p>
      </div>
      <KycEmbed />
    </>
  );
}
