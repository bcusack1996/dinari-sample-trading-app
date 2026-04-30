import "server-only";
import { db } from "@/lib/db";
import { getSessionAddress } from "@/lib/auth";

export type OnboardingStep = "entity" | "kyc" | "account" | "done";

export type OnboardingState = {
  address: string;
  entityId: string | null;
  kycStatus: string | null;
  primaryAccountId: string | null;
  step: OnboardingStep;
};

export async function loadOnboardingState(): Promise<OnboardingState | null> {
  const address = await getSessionAddress();
  if (!address) return null;
  const user = await db.user.findUnique({
    where: { walletAddress: address.toLowerCase() },
  });
  if (!user) return { address, entityId: null, kycStatus: null, primaryAccountId: null, step: "entity" };

  let step: OnboardingStep = "entity";
  if (!user.entityId) step = "entity";
  else if (user.kycStatus !== "PASS") step = "kyc";
  else if (!user.primaryAccountId) step = "account";
  else step = "done";

  return {
    address,
    entityId: user.entityId,
    kycStatus: user.kycStatus,
    primaryAccountId: user.primaryAccountId,
    step,
  };
}
