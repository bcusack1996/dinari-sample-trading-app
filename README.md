# Dinari Sample Trading App

A Next.js sample that onboards a new trader against the **Dinari sandbox API**:
connect MetaMask → create a Dinari `Entity` → complete managed KYC → register
the first `Account` and link the wallet on **Sepolia**. Authentication uses
[thirdweb](https://thirdweb.com) so social login (Google, email, passkey) can
be added later without rewriting the auth layer.

## Stack

- Next.js 15 (App Router, React 19, TypeScript)
- thirdweb v5 (`ConnectButton` + `createAuth` JWT sessions)
- Dinari API SDK (`@dinari/api-sdk`) — server-side only
- Prisma + SQLite (local file)
- Tailwind CSS v4

## Onboarding flow

```text
/                       Landing — connect MetaMask + sign-in (SIWE-style)
/onboarding/entity      Step 1 — POST /v2/entities                       (createEntity)
/onboarding/kyc         Step 2 — POST /v2/entities/{id}/kyc/url          (createManagedCheck) + iframe + status poll
/onboarding/account     Step 3 — POST /v2/entities/{id}/accounts         (account create)
                                 GET  /v2/accounts/{id}/wallet/external/nonce
                                 POST /v2/accounts/{id}/wallet/external  (connect signed nonce)
/dashboard              Post-onboarding — lists accounts (Add account is stubbed)
```

Routing is server-side: every onboarding page reads progress from SQLite and
redirects you to the right step automatically.

## Setup

### 1. Credentials

Both [Dinari sandbox](https://partners.dinari.com) and
[thirdweb](https://thirdweb.com/dashboard) credentials are required.

```bash
cp .env.example .env.local
# fill in:
#   DINARI_API_KEY_ID
#   DINARI_API_SECRET_KEY        ← from partners.dinari.com (shown once at creation)
#   NEXT_PUBLIC_THIRDWEB_CLIENT_ID
#   THIRDWEB_SECRET_KEY
#   THIRDWEB_AUTH_PRIVATE_KEY    ← generate with: openssl rand -hex 32
```

`DATABASE_URL` lives in `.env` (used by Prisma CLI) and `.env.local` (used by
Next runtime). Both are gitignored.

### 2. Database

```bash
npm install
npm run db:push      # creates prisma/dev.db
```

### 3. Run

```bash
npm run dev
# http://localhost:3000
```

## Testing on Sepolia

1. Make sure your MetaMask is on **Sepolia** (chain id `11155111`).
2. Fund the wallet with a small amount of Sepolia ETH from any faucet —
   only needed if you want to test gas-paying flows later. Onboarding itself
   is gasless (the wallet only signs an off-chain ownership proof).
3. Step through the wizard:
   - Connect MetaMask, sign the login payload → lands on `/onboarding/entity`.
   - Submit a display name → SDK call:
     `client.v2.entities.create({ name, reference_id: walletAddress })`.
   - Complete the iframe KYC. The page polls
     `client.v2.entities.kyc.retrieve(entityId)` every 5s and advances on
     `status === "PASS"` (sandbox typically auto-approves).
   - Click **Create account & sign**. Calls
     `client.v2.entities.accounts.create(entityId, { jurisdiction: "BASELINE" })`,
     then `getNonce` → MetaMask prompts you to sign the message → `connect`
     submits the signature with `chain_id: "eip155:11155111"`.

## Notable files

| Path | Purpose |
|------|---------|
| `src/lib/dinari.ts` | Lazy-singleton SDK client (server-only) |
| `src/lib/auth.ts` | thirdweb `createAuth` + httpOnly cookie helpers |
| `src/lib/onboarding.ts` | Resolves the user's current step from DB |
| `src/lib/actions/*.ts` | Server actions wrapping each Dinari call |
| `src/components/ConnectWallet.tsx` | thirdweb `ConnectButton` with SIWE auth hooks |
| `src/app/onboarding/*/page.tsx` | Per-step server pages (each redirects if out of order) |
| `prisma/schema.prisma` | `User` ↔ `Account` map keyed on wallet address |

## Adding social login later

`src/components/ConnectWallet.tsx` already imports `inAppWallet`. Uncomment the
slot in the `wallets` array to surface Google / email / passkey alongside
MetaMask — no other changes needed.

## Security notes

- `.env.local` and `.env` are gitignored — never commit them.
- Rotate the keys you used during development before sharing this repo
  publicly.
- All Dinari SDK calls happen in server actions / route handlers; the secret
  key never reaches the browser.
