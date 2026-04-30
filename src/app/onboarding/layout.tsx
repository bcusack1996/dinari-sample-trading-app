import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";
import { Wordmark } from "@/components/Brand";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await loadOnboardingState();
  if (!state) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="px-8 py-6 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-ink-700)" }}
      >
        <Wordmark className="text-lg" />
        <span
          className="text-xs font-mono"
          style={{ color: "var(--color-ink-500)" }}
        >
          {state.address.slice(0, 6)}…{state.address.slice(-4)}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-16">
        <div className="w-full max-w-xl space-y-10">{children}</div>
      </main>
    </div>
  );
}
