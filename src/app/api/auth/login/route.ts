import { NextRequest, NextResponse } from "next/server";
import { auth, setSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address required" }, { status: 400 });
  }
  const payload = await auth.generatePayload({ address });
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const verified = await auth.verifyPayload(body);
  if (!verified.valid) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  const jwt = await auth.generateJWT({ payload: verified.payload });
  await setSessionCookie(jwt);

  const address = verified.payload.address.toLowerCase();
  await db.user.upsert({
    where: { walletAddress: address },
    create: { walletAddress: address },
    update: {},
  });

  return NextResponse.json({ ok: true, address });
}
