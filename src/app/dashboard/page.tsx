import { redirect } from "next/navigation";
import { loadOnboardingState } from "@/lib/onboarding";
import { db } from "@/lib/db";
import { Wordmark } from "@/components/Brand";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardPage() {
  const state = await loadOnboardingState();
  if (!state) redirect("/");
  if (state.step !== "done") redirect(`/onboarding/${state.step}`);

  const accounts = await db.account.findMany({
    where: { user: { walletAddress: state.address.toLowerCase() } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="px-8 py-6 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-ink-700)" }}
      >
        <Wordmark className="text-lg" />
        <div className="flex items-center gap-4">
          <span
            className="text-xs font-mono"
            style={{ color: "var(--color-ink-500)" }}
          >
            {state.address.slice(0, 6)}…{state.address.slice(-4)}
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 px-8 py-12 max-w-4xl mx-auto w-full space-y-10">
        <div className="space-y-2">
          <p
            className="uppercase text-xs tracking-[0.25em]"
            style={{ color: "var(--color-gold-400)" }}
          >
            Welcome aboard
          </p>
          <h1 className="text-4xl font-medium tracking-tight">
            You&rsquo;re ready to trade
          </h1>
          <p style={{ color: "var(--color-paper-200)" }}>
            Onboarding complete. Trading UI for tokenized equities ships next.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Accounts</h2>
            <button className="btn-ghost" disabled>
              Add account (coming soon)
            </button>
          </div>
          <ul className="space-y-3">
            {accounts.map((a) => (
              <li key={a.id} className="card flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-mono text-sm">{a.dinariId}</div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-ink-500)" }}
                  >
                    {a.jurisdiction} ·{" "}
                    {a.walletLinked ? "Wallet linked" : "Wallet not linked"}
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "var(--color-ink-700)",
                    color: "var(--color-emerald-400)",
                  }}
                >
                  ACTIVE
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
