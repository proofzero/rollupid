import type { MetaFunction, LinksFunction, LoaderFunction } from "@remix-run/cloudflare";
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

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "3ID",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
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
        <LiveReload />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(
              browserEnv.ENV
            )}`,
          }}
        />
      </body>
    </html>
  );
}
