import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { json } from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";

import styles from "./styles/tailwind.css";
import social from "./assets/social.png";
import appleIcon from "./assets/apple-touch-icon.png";
import icon32 from "./assets/favicon-32x32.png";
import icon16 from "./assets/favicon-16x16.png";
import faviconSvg from "./assets/favicon.svg";
import favicon from "./assets/favicon.ico";
import manifest from "./assets/site.webmanifest";
import maskIcon from "./assets/safari-pinned-tab.svg";

import { links as buttonLinks } from "~/components/buttons";
import { links as headNavLink } from "~/components/head-nav";



export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "3ID",
  viewport: "width=device-width,initial-scale=1",
  "og:title": "3ID - Decentralized Web Passport",
  "og:site_name": "3ID",
  "og:url": "https://dapp.threeid.xyz",
  "og:description":
    "3ID turns your blockchain accounts into multi-chain decentralized identities with improved auth, secure messaging and more.",
  "og:image": social,
  "theme-color": "#673ab8",
  "mobile-web-app-capable": "yes",
  "apple-mobile-web-app-capable": "yes",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "apple-touch-icon", href: appleIcon, sizes: "180x180" },
  { rel: "icon", type: "image/png", href: icon32, sizes: "32x32" },
  { rel: "icon", type: "image/png", href: icon16, sizes: "16x16" },
  { rel: "manifest", href: manifest },
  { rel: "mask-icon", href: maskIcon, color: "#5bbad5" },
  { rel: "shortcut icon", href: favicon },
  { rel: "shortcut icon", type: "image/svg+xml", href: faviconSvg },
  ...buttonLinks(),
  ...headNavLink(),
];

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
    },
  });
};

export default function App() {
  const browserEnv = useLoaderData();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}
