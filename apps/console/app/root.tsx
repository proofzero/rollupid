/**
 * @file app/root.tsx
 */

import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'

import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'

import { json } from '@remix-run/cloudflare'

import { ErrorPage } from '@proofzero/design-system/src/pages/error/ErrorPage'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useLoaderData,
  useTransition,
  useCatch,
} from '@remix-run/react'

import { useEffect } from 'react'

import globalStyles from '@proofzero/design-system/src/styles/global.css'
import tailwindStylesheetUrl from './styles/tailwind.css'
import faviconSvg from './images/favicon.svg'
import appleIcon from './images/apple-touch-icon.png'
import icon32 from './images/favicon-32x32.png'
import icon16 from './images/favicon-16x16.png'

import * as gtag from '~/utils/gtags.client'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStyles },
    { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
    { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
    { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
    { rel: 'shortcut icon', href: faviconSvg },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Console - Rollup',
  viewport: 'width=device-width,initial-scale=1',
})

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG,
      PROFILE_APP_URL,
    },
  })
}

export default function App() {
  const transition = useTransition()
  const location = useLocation()
  const browserEnv = useLoaderData()

  const GATag = browserEnv.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {!GATag ? null : (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GATag}`}
            />
            <script
              async
              id="gtag-init"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GATag}', {
                    page_path: window.location.pathname,
                  });
              `,
              }}
            />
          </>
        )}
        {transition.state === 'loading' ? <Loader /> : null}
        <Outlet />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              browserEnv.ENV
            )}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary = ({
  error,
}: {
  error?: {
    stack: any
    message: string
  }
}) => {
  console.error('ErrorBoundary', error)
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
            error={error}
          />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.error('CatchBoundary', { caught })

  let secondary = 'Something went wrong'
  switch (caught.status) {
    case 404:
      secondary = 'Page not found'
      break
    case 400:
      secondary = 'Bad Request'
      break
    case 500:
      secondary = 'Internal Server Error'
      break
  }
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="min-h-[100dvh] flex justify-center items-center">
        <div className="w-full">
          <ErrorPage code={caught.status.toString()} message={secondary} />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
