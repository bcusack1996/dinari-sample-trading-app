import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";

export default async function OnboardingIndex() {
  const state = await loadOnboardingState();
  if (!state) redirect("/");
  if (state.step === "done") redirect("/dashboard");
  redirect(`/onboarding/${state.step}`);
}
