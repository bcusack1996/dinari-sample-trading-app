"use server";

import { dinari } from "@/lib/dinari";
import { db } from "@/lib/db";
import { requireSessionAddress } from "@/lib/auth";

export async function startManagedKycAction(): Promise<
  { embedUrl: string; expiresAt: string } | { error: string }
> {
  const address = await requireSessionAddress();
  const user = await db.user.findUnique({
    where: { walletAddress: address.toLowerCase() },
  });
  if (!user?.entityId) return { error: "Entity not yet created." };

  const res = await dinari().v2.entities.kyc.createManagedCheck(user.entityId);
  return { embedUrl: res.embed_url, expiresAt: res.expiration_dt };
}

export async function refreshKycStatusAction(): Promise<
  { status: string | null } | { error: string }
> {
  const address = await requireSessionAddress();
  const user = await db.user.findUnique({
    where: { walletAddress: address.toLowerCase() },
  });
  if (!user?.entityId) return { error: "Entity not yet created." };

  try {
    const info = await dinari().v2.entities.kyc.retrieve(user.entityId);
    await db.user.update({
      where: { id: user.id },
      data: { kycStatus: info.status },
    });
    return { status: info.status };
  } catch {
    // No KYC check exists yet (user hasn't started the embed flow)
    return { status: null };
  }
}
