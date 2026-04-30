"use client";

import { useActionState } from "react";
import { createEntityAction } from "@/lib/actions/entity";

type State = { error?: string } | undefined;

export function EntityForm({ walletAddress }: { walletAddress: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, fd) => {
      return await createEntityAction(fd);
    },
    undefined,
  );

  return (
    <form action={formAction} className="card space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={150}
          placeholder="e.g. Alex Trader"
          className="input"
        />
        <p className="text-xs" style={{ color: "var(--color-ink-500)" }}>
          Reference ID will be{" "}
          <span className="font-mono">{walletAddress.toLowerCase()}</span>
        </p>
      </div>

      {state?.error && (
        <p className="text-sm" style={{ color: "var(--color-rose-400)" }}>
          {state.error}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating…" : "Create entity"}
      </button>
    </form>
  );
}
