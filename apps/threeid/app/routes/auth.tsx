import { Outlet, useLoaderData } from "@remix-run/react";

import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from "wagmi";

import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import styles from "../styles/auth.css";
import logo from "../assets/three-id-logo.svg";

import { links as spinnerLinks } from "~/components/spinner";

import { LoaderFunction } from "@remix-run/cloudflare";

import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

export function links() {
  return [...spinnerLinks(), { rel: "stylesheet", href: styles }];
}

export const loader: LoaderFunction = () => {
  return {
    // @ts-ignore
    ALCHEMY_PUBLIC_API_KEY: ALCHEMY_PUBLIC_API_KEY,
  };
};

export default function Auth() {
  const ld = useLoaderData();

  const { chains, provider } = configureChains(
    defaultChains,
    [
      publicProvider(),
      alchemyProvider({
        // @ts-ignore
        apiKey: ld.ALCHEMY_PUBLIC_API_KEY,
      }),
    ],
    {
      targetQuorum: 1,
      pollingInterval: 5_000,
    }
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
  });

  return (
    <div className="wrapper grid grid-row-3 gap-4">
      <nav className="col-span-3">
        <img src={logo} alt="threeid" />
      </nav>
      <article className="content col-span-3">
        <WagmiConfig client={client}>
          <Outlet />
        </WagmiConfig>
      </article>
      <footer className="col-span-3">
        <p>
          3ID is non-custodial and secure. We will never request access to your
          assets.
        </p>
      </footer>
    </div>
  );
}
