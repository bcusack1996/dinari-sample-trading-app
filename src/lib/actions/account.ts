"use server";

import { redirect } from "next/navigation";
import { dinari } from "@/lib/dinari";
import { db } from "@/lib/db";
import { requireSessionAddress } from "@/lib/auth";
import { APP_CHAIN_CAIP2 } from "@/lib/chains";

async function ensureUserWithEntity() {
  const address = await requireSessionAddress();
  const user = await db.user.findUnique({
    where: { walletAddress: address.toLowerCase() },
  });
  if (!user) throw new Error("User not found");
  if (!user.entityId) throw new Error("Entity not yet created");
  return { address: address.toLowerCase(), user };
}

export async function ensurePrimaryAccountAction(): Promise<
  { accountId: string } | { error: string }
> {
  try {
    const { user } = await ensureUserWithEntity();
    if (user.primaryAccountId) return { accountId: user.primaryAccountId };

    const account = await dinari().v2.entities.accounts.create(user.entityId!, {
      jurisdiction: "BASELINE",
    });

    await db.user.update({
      where: { id: user.id },
      data: { primaryAccountId: account.id },
    });
    await db.account.create({
      data: {
        dinariId: account.id,
        jurisdiction: account.jurisdiction,
        userId: user.id,
      },
    });
    return { accountId: account.id };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getWalletLinkNonceAction(): Promise<
  { message: string; nonce: string; accountId: string } | { error: string }
> {
  try {
    const { address, user } = await ensureUserWithEntity();
    const ensured = user.primaryAccountId
      ? { accountId: user.primaryAccountId }
      : await ensurePrimaryAccountAction();
    if ("error" in ensured) return { error: ensured.error };

    const nonceRes = await dinari().v2.accounts.wallet.external.getNonce(
      ensured.accountId,
      { chain_id: APP_CHAIN_CAIP2, wallet_address: address },
    );
    return {
      message: nonceRes.message,
      nonce: nonceRes.nonce,
      accountId: ensured.accountId,
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function connectWalletAction(input: {
  accountId: string;
  nonce: string;
  signature: string;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const { address, user } = await ensureUserWithEntity();

    await dinari().v2.accounts.wallet.external.connect(input.accountId, {
      chain_id: APP_CHAIN_CAIP2,
      nonce: input.nonce,
      signature: input.signature,
      wallet_address: address,
    });

    await db.account.update({
      where: { dinariId: input.accountId },
      data: { walletLinked: true },
    });

    return { ok: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function finishOnboardingAction() {
  await requireSessionAddress();
  redirect("/dashboard");
}
