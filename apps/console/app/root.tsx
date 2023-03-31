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
import { parseJwt, requireJWT } from './utilities/session.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { AccountURN } from '@proofzero/urns/account'

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

export type LoaderData = {
  apps: {
    clientId: string
    name?: string
    icon?: string
    published?: boolean
    createdTimestamp?: number
  }[]
  avatarUrl: string
  PASSPORT_URL: string
  displayName: string
  ENV: {
    INTERNAL_GOOGLE_ANALYTICS_TAG: string
  }
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  try {
    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const apps = await starbaseClient.listApps.query()
    const reshapedApps = apps.map((a) => {
      return {
        clientId: a.clientId,
        name: a.app?.name,
        icon: a.app?.icon,
        published: a.published,
        createdTimestamp: a.createdTimestamp,
      }
    })

    let avatarUrl = ''
    let displayName = ''
    try {
      const profile = await accountClient.getProfile.query({
        account: accountURN,
      })
      avatarUrl = profile?.pfp?.image || ''
      displayName = profile?.displayName || ''
    } catch (e) {
      console.error('Could not retrieve profile image.', e)
    }

    return json<LoaderData>({
      apps: reshapedApps,
      avatarUrl,
      PASSPORT_URL,
      ENV: { INTERNAL_GOOGLE_ANALYTICS_TAG },
      displayName,
    })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

export default function App() {
  const transition = useTransition()
  const location = useLocation()
  const loaderData = useLoaderData()

  const GATag = loaderData.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  const { apps, avatarUrl, PASSPORT_URL, displayName } = loaderData

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
        <Outlet context={{ apps, avatarUrl, PASSPORT_URL, displayName }} />
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              loaderData.ENV
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
