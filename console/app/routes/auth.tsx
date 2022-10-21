/**
 * @file app/routes/auth.tsx
 */

import { json, redirect } from "@remix-run/cloudflare";

import { Outlet } from "@remix-run/react";

import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from "wagmi";

import { publicProvider } from "wagmi/providers/public";

import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import { getSession, requireJWT } from "~/shared/utilities/session.server";
import { oortSend } from "~/shared/utilities/rpc.server";

import logo from "~/images/kubelt.svg";

// Loader
// -----------------------------------------------------------------------------

// @ts-ignore
// FIXME
/*
export const loader = async ({ request }) => {
  const session = await getSession(request);
  if (session.has("jwt")) {
    const jwt = session.get("jwt");

    // TODO
    const claims = await oortSend("kb_getCoreClaims", [], {
      jwt,
      cookie: request.headers.get("Cookie"),
    });

    console.log(`claims: ${claims}`);

    // TODO
    if (claims.result && claims.result.includes("3id.enter")) {
      return redirect("/dashboard");
    }

    //requireJWT(request)
  }

  return null;
};
*/

// Component
// -----------------------------------------------------------------------------

export default function Auth() {
  // From the WAGMI docs: In a production app, it is not recommended to only pass
  // publicProvider to configureChains as you will probably face rate-limiting on
  // the public provider endpoints. It is recommended to also pass an alchemyProvider
  // or infuraProvider as well.
  const { chains, provider, webSocketProvider } = configureChains(
    defaultChains,
    [publicProvider()]
  );

  const client = createClient({
    autoConnect: true,
    connectors: [
      new CoinbaseWalletConnector({ chains }),
      new MetaMaskConnector({ chains }),
      new InjectedConnector({
        chains,
        options: {
          name: "Other Wallet",
          shimDisconnect: true,
        },
      }),
    ],
    provider,
    webSocketProvider,
  });

  return (
    <div className="flex flex-col gap-4 h-full">
      <nav className="p-4">
        <img className="w-[40px]" src={logo} alt="Kubelt logo" />
      </nav>
      <article className="grow grid items-center min-w-[300px]">
        <WagmiConfig client={client}>
          <Outlet />
        </WagmiConfig>
      </article>
      <footer className="p-4 justify-center items-center">
        <p className="text-center text-kubelt-darkgrey font-normal text-sm leading-6">
          3ID is non-custodial and secure.
          <br />
          We will never request access to your assets.
        </p>
      </footer>
    </div>
  );
}
