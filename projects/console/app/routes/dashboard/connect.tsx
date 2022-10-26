/**
 * @file app/routes/dashboard/connect.tsx
 */

import { Link } from "@remix-run/react";

import EmptyPrompt from "~/components/EmptyPrompt";

import wallet from "~/images/wallet.svg";

// Component
// -----------------------------------------------------------------------------

export default function WalletPage() {
  return (
    <div>
      <h3 className="text-2xl font-bold">Dashboard</h3>
      <EmptyPrompt
        icon={wallet}
        alt="Wallet icon"
        title="Connect a Wallet"
        description="Get started by connecting your wallet."
        prompt="Connect a Wallet"
        link="../wallet"
      />
    </div>
  );
}
