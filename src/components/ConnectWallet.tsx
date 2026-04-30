"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useRouter } from "next/navigation";
import { client } from "@/lib/thirdweb-client";
import { APP_CHAIN } from "@/lib/chains";

const wallets = [
  createWallet("io.metamask"),
  // social/email login slots — surface them later by exposing here:
  // inAppWallet({ auth: { options: ["google", "email", "passkey"] } }),
];

export function ConnectWallet() {
  const router = useRouter();

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={APP_CHAIN}
      connectButton={{ label: "Connect MetaMask" }}
      connectModal={{ size: "compact", title: "Sign in to Dinari" }}
      theme="dark"
      auth={{
        getLoginPayload: async ({ address }) => {
          const r = await fetch(
            `/api/auth/login?address=${encodeURIComponent(address)}`,
          );
          if (!r.ok) throw new Error("Failed to get login payload");
          return r.json();
        },
        doLogin: async (params) => {
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(params),
          });
          if (!r.ok) throw new Error("Login failed");
          router.push("/onboarding");
          router.refresh();
        },
        isLoggedIn: async () => {
          const r = await fetch("/api/auth/me");
          if (!r.ok) return false;
          const data = await r.json();
          return Boolean(data.address);
        },
        doLogout: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        },
      }}
    />
  );
}
