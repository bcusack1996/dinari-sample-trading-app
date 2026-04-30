"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startManagedKycAction, refreshKycStatusAction } from "@/lib/actions/kyc";

type Phase = "loading" | "ready" | "error";

export function KycEmbed() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdvancing, startAdvance] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await startManagedKycAction();
      if (cancelled) return;
      if ("error" in res) {
        setErrorMsg(res.error);
        setPhase("error");
      } else {
        setEmbedUrl(res.embedUrl);
        setPhase("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "ready") return;
    let cancelled = false;
    const tick = async () => {
      const r = await refreshKycStatusAction();
      if (cancelled) return;
      if ("status" in r) {
        setStatus(r.status);
        if (r.status === "PASS") {
          startAdvance(() => router.push("/onboarding/account"));
          return;
        }
      }
    };
    const interval = setInterval(tick, 5000);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase, router]);

  if (phase === "loading") {
    return (
      <div className="card text-sm" style={{ color: "var(--color-paper-200)" }}>
        Preparing your KYC session…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="card text-sm" style={{ color: "var(--color-rose-400)" }}>
        {errorMsg ?? "Could not start KYC."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="card overflow-hidden p-0"
        style={{ height: "640px" }}
      >
        {embedUrl && (
          <iframe
            src={embedUrl}
            allow="camera; microphone; clipboard-read; clipboard-write"
            className="w-full h-full"
            title="Dinari KYC"
          />
        )}
      </div>

      <div
        className="flex items-center justify-between text-xs"
        style={{ color: "var(--color-ink-500)" }}
      >
        <span>
          Status:{" "}
          <span
            className="font-mono"
            style={{
              color:
                status === "PASS"
                  ? "var(--color-emerald-400)"
                  : status === "FAIL"
                    ? "var(--color-rose-400)"
                    : "var(--color-gold-400)",
            }}
          >
            {status ?? "PENDING"}
          </span>
          {isAdvancing && " — advancing…"}
        </span>
        {embedUrl && (
          <a
            href={embedUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--color-paper-200)" }}
            className="underline underline-offset-4"
          >
            Open in new tab
          </a>
        )}
      </div>
    </div>
  );
}
