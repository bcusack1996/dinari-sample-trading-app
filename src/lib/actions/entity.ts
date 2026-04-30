"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { dinari } from "@/lib/dinari";
import { db } from "@/lib/db";
import { requireSessionAddress } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(150),
});

export async function createEntityAction(formData: FormData) {
  const address = await requireSessionAddress();
  const parsed = schema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: "Please enter a valid name (1–150 characters)." };
  }

  const lower = address.toLowerCase();
  const user = await db.user.findUnique({ where: { walletAddress: lower } });
  if (user?.entityId) redirect("/onboarding/kyc");

  const entity = await dinari().v2.entities.create({
    name: parsed.data.name,
    reference_id: lower,
  });

  await db.user.update({
    where: { walletAddress: lower },
    data: { entityId: entity.id },
  });

  redirect("/onboarding/kyc");
}
