import { redirect } from "next/navigation";
import { getSessionAddress } from "@/lib/auth";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Wordmark } from "@/components/Brand";

export default async function LandingPage() {
  const address = await getSessionAddress();
  if (address) redirect("/onboarding");

  return (
    <main className="hero-spotlight min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between">
        <Wordmark className="text-lg" />
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          <p
            className="uppercase text-xs tracking-[0.25em]"
            style={{ color: "var(--color-gold-400)" }}
          >
            Tokenized equities · Sandbox
          </p>
          <h1
            className="text-5xl md:text-6xl font-medium leading-[1.05] tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Trade tokenized stocks.
            <br />
            <span style={{ color: "var(--color-paper-200)" }}>
              Sign in with your wallet.
            </span>
          </h1>
          <p
            className="text-lg max-w-lg mx-auto"
            style={{ color: "var(--color-paper-200)" }}
          >
            Connect MetaMask to begin onboarding. We&rsquo;ll create your Dinari
            entity, walk you through KYC, and link your Sepolia wallet — all in
            three short steps.
          </p>
          <div className="flex justify-center pt-4">
            <ConnectWallet />
          </div>
          <p
            className="text-xs pt-6"
            style={{ color: "var(--color-ink-500)" }}
          >
            Sample app for the Dinari sandbox · Sepolia testnet only
          </p>
        </div>
      </section>
    </main>
  );
}
