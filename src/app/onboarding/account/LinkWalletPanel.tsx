"use client";

import { useState, useTransition } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import {
  getWalletLinkNonceAction,
  connectWalletAction,
} from "@/lib/actions/account";

type Phase = "idle" | "fetching" | "signing" | "submitting" | "done" | "error";

export function LinkWalletPanel({ walletAddress }: { walletAddress: string }) {
  const router = useRouter();
  const account = useActiveAccount();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleLink() {
    setErrorMsg(null);
    if (!account) {
      setErrorMsg("Wallet not connected.");
      setPhase("error");
      return;
    }
    if (account.address.toLowerCase() !== walletAddress.toLowerCase()) {
      setErrorMsg(
        "Connected wallet does not match the address you signed in with.",
      );
      setPhase("error");
      return;
    }

    setPhase("fetching");
    const nonceRes = await getWalletLinkNonceAction();
    if ("error" in nonceRes) {
      setErrorMsg(nonceRes.error);
      setPhase("error");
      return;
    }

    setPhase("signing");
    let signature: string;
    try {
      signature = await account.signMessage({ message: nonceRes.message });
    } catch (err) {
      setErrorMsg((err as Error).message ?? "User rejected signature.");
      setPhase("error");
      return;
    }

    setPhase("submitting");
    const connectRes = await connectWalletAction({
      accountId: nonceRes.accountId,
      nonce: nonceRes.nonce,
      signature,
    });
    if ("error" in connectRes) {
      setErrorMsg(connectRes.error);
      setPhase("error");
      return;
    }

    setPhase("done");
    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-5">
      <dl className="text-sm space-y-1.5">
        <div className="flex justify-between">
          <dt style={{ color: "var(--color-ink-500)" }}>Wallet</dt>
          <dd className="font-mono">
            {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: "var(--color-ink-500)" }}>Network</dt>
          <dd>Sepolia · eip155:11155111</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: "var(--color-ink-500)" }}>Jurisdiction</dt>
          <dd>BASELINE</dd>
        </div>
      </dl>

      {errorMsg && (
        <p className="text-sm" style={{ color: "var(--color-rose-400)" }}>
          {errorMsg}
        </p>
      )}

      <button
        onClick={handleLink}
        className="btn-primary w-full"
        disabled={phase === "fetching" || phase === "signing" || phase === "submitting" || phase === "done" || pending}
      >
        {phase === "idle" && "Create account & sign"}
        {phase === "fetching" && "Requesting nonce…"}
        {phase === "signing" && "Awaiting signature…"}
        {phase === "submitting" && "Linking wallet…"}
        {phase === "done" && "Linked — redirecting…"}
        {phase === "error" && "Try again"}
      </button>
    </div>
  );
}
