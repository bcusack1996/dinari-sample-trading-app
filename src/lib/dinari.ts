import "server-only";
import Dinari from "@dinari/api-sdk";

let cached: Dinari | null = null;

export function dinari(): Dinari {
  if (cached) return cached;

  const apiKeyID = process.env.DINARI_API_KEY_ID;
  const apiSecretKey = process.env.DINARI_API_SECRET_KEY;
  if (!apiKeyID || !apiSecretKey) {
    throw new Error(
      "Missing DINARI_API_KEY_ID or DINARI_API_SECRET_KEY in environment.",
    );
  }

  cached = new Dinari({
    apiKeyID,
    apiSecretKey,
    baseURL: null,
    environment: "sandbox",
  });
  return cached;
}
