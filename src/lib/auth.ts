import "server-only";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { cookies } from "next/headers";
import { createThirdwebClient } from "thirdweb";

const COOKIE_NAME = "dinari_session";

const secretKey = process.env.THIRDWEB_SECRET_KEY;
const authPrivateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!secretKey) throw new Error("Missing THIRDWEB_SECRET_KEY");
if (!authPrivateKey) throw new Error("Missing THIRDWEB_AUTH_PRIVATE_KEY");

const serverClient = createThirdwebClient({ secretKey });

const adminAccount = privateKeyToAccount({
  client: serverClient,
  privateKey: authPrivateKey.startsWith("0x")
    ? authPrivateKey
    : `0x${authPrivateKey}`,
});

export const auth = createAuth({
  domain: new URL(appUrl).host,
  client: serverClient,
  adminAccount,
  jwt: { expirationTimeSeconds: 60 * 60 * 24 * 7 },
});

export async function setSessionCookie(jwt: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionAddress(): Promise<string | null> {
  const store = await cookies();
  const jwt = store.get(COOKIE_NAME)?.value;
  if (!jwt) return null;
  const result = await auth.verifyJWT({ jwt });
  if (!result.valid) return null;
  return result.parsedJWT.sub ?? null;
}

export async function requireSessionAddress(): Promise<string> {
  const address = await getSessionAddress();
  if (!address) throw new Error("Unauthenticated");
  return address;
}
