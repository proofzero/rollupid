/**
 * @file app/root.tsx
 */

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'

import { useLoaderData } from '@remix-run/react'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import globalStyles from '@kubelt/design-system/src/styles/global.css'
import tailwindStylesheetUrl from './styles/tailwind.css'

function Analytics(props) {
  return (
    <script>
      window.dataLayer = window.dataLayer || []
      function gtag(){dataLayer.push(arguments)}
      gtag('js', new Date())
      gtag('config', {props.tag})
    </script>
  )
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStyles },

    { rel: 'icon', href: '/favicon.ico' },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Console',
  viewport: 'width=device-width,initial-scale=1',
})

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG
    },
  })
}

export default function App() {
  const browserEnv = useLoaderData()
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
        <script async src="https://www.googletagmanager.com/gtag/js?id={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG}"></script>
        <Analytics tag={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG} />
      </body>
    </html>
  )
}

export const ErrorBoundary = ({
  error,
}: {
  error?: {
    stack: any
  }
}) => {
  const browserEnv = useLoaderData()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="min-h-[100dvh] flex justify-center items-center">
        <div className="w-full">
          <ErrorPage
            code="Error"
            message="Something went terribly wrong!"
            trace={error?.stack}
          />
        </div>

        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
        <Scripts />
        <script async src="https://www.googletagmanager.com/gtag/js?id={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG}"></script>
        <Analytics tag={window.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG} />
      </body>
    </html>
  )
}
