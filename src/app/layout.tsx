import type { Metadata } from "next";
import { ThirdwebProviders } from "@/components/ThirdwebProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dinari Sample Trading App",
  description:
    "Onboard as a trader on Dinari — connect MetaMask, create your entity, complete KYC, and link a Sepolia wallet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThirdwebProviders>{children}</ThirdwebProviders>
      </body>
    </html>
  );
}
