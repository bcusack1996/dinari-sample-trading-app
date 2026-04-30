"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startManagedKycAction, refreshKycStatusAction } from "@/lib/actions/kyc";

type Phase = "loading" | "ready" | "error";

const IFRAME_LOAD_TIMEOUT_MS = 6000;

export function KycEmbed() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
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
    if (!embedUrl || iframeLoaded) return;
    const t = setTimeout(() => setIframeBlocked(true), IFRAME_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [embedUrl, iframeLoaded]);

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
      {iframeBlocked ? (
        <FallbackPanel embedUrl={embedUrl!} />
      ) : (
        <>
          <div
            className="card overflow-hidden p-0 relative"
            style={{ height: "640px" }}
          >
            {embedUrl && (
              <iframe
                src={embedUrl}
                allow="camera; microphone; clipboard-read; clipboard-write"
                className="w-full h-full"
                title="Dinari KYC"
                onLoad={() => setIframeLoaded(true)}
              />
            )}
            {!iframeLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center text-sm"
                style={{
                  background: "var(--color-ink-900)",
                  color: "var(--color-paper-200)",
                }}
              >
                Loading KYC interface…
              </div>
            )}
          </div>
          <p
            className="text-xs"
            style={{ color: "var(--color-ink-500)" }}
          >
            Embed not loading?{" "}
            <button
              type="button"
              onClick={() => setIframeBlocked(true)}
              className="underline underline-offset-4"
              style={{ color: "var(--color-paper-200)" }}
            >
              Open in a new tab instead
            </button>
            .
          </p>
        </>
      )}

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
        <span>Polling every 5s</span>
      </div>
    </div>
  );
}

function FallbackPanel({ embedUrl }: { embedUrl: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="card space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Open KYC in a new tab</h2>
        <p
          className="text-sm"
          style={{ color: "var(--color-paper-200)" }}
        >
          The embedded KYC view didn&rsquo;t load — this usually means the
          provider blocks framing. Open the link below in a new tab. We&rsquo;ll
          keep checking for completion automatically; come back here once
          you&rsquo;re done.
        </p>
      </div>

      <a
        href={embedUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-primary inline-flex"
      >
        Open KYC flow ↗
      </a>

      <div
        className="space-y-2 text-xs"
        style={{ color: "var(--color-ink-500)" }}
      >
        <div>Or copy the link manually:</div>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 truncate rounded px-2 py-1.5 font-mono"
            style={{
              background: "var(--color-ink-800)",
              color: "var(--color-paper-200)",
            }}
            title={embedUrl}
          >
            {embedUrl}
          </code>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(embedUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // clipboard API can fail in insecure contexts; ignore
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
