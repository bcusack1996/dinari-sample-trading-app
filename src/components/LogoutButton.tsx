"use client";

import { useRouter } from "next/navigation";
import { useDisconnect, useActiveWallet } from "thirdweb/react";

export function LogoutButton() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  return (
    <button
      className="btn-ghost text-xs"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        if (wallet) disconnect(wallet);
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
