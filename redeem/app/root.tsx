import type { MetaFunction, LoaderFunction, LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useCatch, useNavigate  } from "@remix-run/react";

import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";


// import styles from "~/assets/styles.css";
import styles from "./tailwind.css";
import baseStyles from "./base.css";

import blankCard from "~/assets/blankcard.png";
import logo from "~/assets/logo.png";
import sad from "~/assets/sad.png";
import faviconSvg from "~/assets/favicon.svg";

import { startSession } from "~/datadog.client";

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      // @ts-ignore
      DATADOG_APPLICATION_ID: DATADOG_APPLICATION_ID,
      // @ts-ignore
      DATADOG_CLIENT_TOKEN: DATADOG_CLIENT_TOKEN,
      // @ts-ignore
      DATADOG_SERVICE_NAME: DATADOG_SERVICE_NAME,
      // @ts-ignore
      DATADOG_ENV: DATADOG_ENV,
      // @ts-ignore
      INVITE_CONTRACT_ADDRESS: INVITE_CONTRACT_ADDRESS,
    },
  });
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "3ID Redeem",
  viewport: "width=device-width,initial-scale=1",
  "og:title": "Get 3ID - Decentralized Web Passport",
  "og:site_name": "Get 3ID",
  "og:url": "https://get.threeid.xyz",
  "og:description":
    "Claim your 3ID Invite.",
  "og:image": blankCard,
  "theme-color": "#673ab8",
  "mobile-web-app-capable": "yes",
  "apple-mobile-web-app-capable": "yes",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: baseStyles },
  { rel: "shortcut icon", type: "image/svg+xml", href: faviconSvg },
];

export default function App() {
  const browserEnv = useLoaderData();
  typeof window !== 'undefined' && startSession();


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
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
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
              3ID is non-custodial and secure.
              <br />
              We will never request access to your assets.
            </p>
          </footer>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}

// https://remix.run/docs/en/v1/guides/errors

export function ErrorBoundary({ error }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="error-screen">
        <div className="wrapper grid grid-row-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="threeid" />
          </nav>
          <article className="content col-span-3">
            <div className="error justify-center items-center">
              <img className="m-auto pb-12" src={sad}/>
              <p className="error-message">
                Something went terribly wrong!
              </p>
              <p className="error-secondary-message">{error.message}</p>
              <p className="error-secondary-message">
                If this problem persists please join Discord for help
              </p>
              
              <div className="error-buttons grid grid-rows-1 text-center">
                  {/* <BaseButtonAnchor text={"Go to Discord"} color={"dark"} href={"https://discord.gg/threeid"} /> */}
              </div>
            </div>
          </article>
          <article className="content col-span-3 m-12">
          <div className="error justify-center items-center">
              <p>The stack trace is:</p>
              <pre>{error.stack}</pre>
            </div>
          </article>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const navigate = useNavigate()
  const goBack = () => { 
    navigate(-1) 
  }
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="error-screen">
        <div className="wrapper grid grid-row-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="threeid" />
          </nav>
          <article className="content col-span-3">
            <div className="error justify-center items-center">
              <img className="m-auto pb-12" src={sad}/>
              <p className="error-message">
                Oops!
              </p>
              <p className="error-secondary-message">{caught.status} {caught.statusText}</p>
              <div className="error-buttons grid grid-rows-1 text-center">
                  {/* <BaseButton onClick={goBack} text={"Go Back"} color={"dark"} /> */}
              </div>
            </div>
          </article>
          <div>{" "}</div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  );
}
