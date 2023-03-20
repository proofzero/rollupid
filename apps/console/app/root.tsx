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
import favIcon from './images/favicon.svg'

import * as gtag from '~/utils/gtags.client'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStyles },
    { rel: 'icon', href: favIcon },
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
  const profileURL = browserEnv.ENV.PROFILE_APP_URL

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
        <Outlet context={{ profileURL }} />
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
