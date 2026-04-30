import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";
import { StepIndicator } from "@/components/StepIndicator";
import { LinkWalletPanel } from "./LinkWalletPanel";

export default async function AccountStepPage() {
  const state = await loadOnboardingState();
  if (!state) redirect("/");
  if (state.step === "entity") redirect("/onboarding/entity");
  if (state.step === "kyc") redirect("/onboarding/kyc");
  if (state.step === "done") redirect("/dashboard");

  return (
    <>
      <StepIndicator current="account" />
      <div className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">
          Link your Sepolia wallet
        </h1>
        <p style={{ color: "var(--color-paper-200)" }}>
          We&rsquo;ll create your first Dinari <code className="font-mono text-sm">Account</code>{" "}
          and prove ownership of your wallet by signing a message. You&rsquo;ll be
          on Sepolia (chain ID 11155111).
        </p>
      </div>
      <LinkWalletPanel walletAddress={state.address} />
    </>
  );
}
