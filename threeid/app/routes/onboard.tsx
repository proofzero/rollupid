import { redirect } from "@remix-run/cloudflare";

import { Outlet, useLoaderData } from "@remix-run/react";

import styles from "../styles/auth.css";
import logo from "../assets/three-id-logo.svg";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";

import {
  configureChains,
  createClient,
  defaultChains,
  useNetwork,
  WagmiConfig,
} from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

// @ts-ignore
export const loader = async ({ request }) => {
  console.log("Calling loader");

  const session = await getUserSession(request);
  if (!session || !session.has("jwt")) {
    return redirect("/auth");
  }

  const jwt = session.get("jwt");

  const claimsRes = await oortSend("kb_getCoreClaims", [], {
    jwt: jwt,
    cookie: request.headers.get("Cookie"),
  });

  if (!claimsRes.result.includes("3id.enter")) {
    return redirect(`/auth/gate/${session.get("address")}`);
  }

  return null;
};

const Onboard = () => {
  useLoaderData();

  const { chains, provider, webSocketProvider } = configureChains(
    defaultChains,
    [publicProvider()]
  );

  const client = createClient({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new InjectedConnector({
        chains,
        options: {
          name: "Injected",
          shimDisconnect: true,
        },
      }),
    ],
    provider,
    webSocketProvider,
  });

  return (
    <>
      <div className="grid grid-row-3 gap-4">
        <nav className="col-span-3">
          <img src={logo} alt="threeid" />
        </nav>
      </div>

      <div className="max-w-4xl mx-auto mt-14 lg:mt-28 p-4">
        <div className="flex flex-col p-6 lg:bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-md min-h-[580px] space-y-4">
          <WagmiConfig client={client}>
            <Outlet />
          </WagmiConfig>
        </div>
      </div>
    </>
  );
};

export default Onboard;
