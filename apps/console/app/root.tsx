/**
 * @file app/root.tsx
 */

import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
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
  useFetcher,
} from '@remix-run/react'

import { useContext, useEffect } from 'react'

import globalStyles from '@proofzero/design-system/src/styles/global.css'
import tailwindStylesheetUrl from './styles/tailwind.css'
import faviconSvg from './images/favicon.svg'
import appleIcon from './images/apple-touch-icon.png'
import icon32 from './images/favicon-32x32.png'
import icon16 from './images/favicon-16x16.png'

import * as gtag from '~/utils/gtags.client'
import { parseJwt, requireJWT } from './utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import type { IdentityURN } from '@proofzero/urns/identity'

import { NonceContext } from '@proofzero/design-system/src/atoms/contexts/nonce-context'

import useTreeshakeHack from '@proofzero/design-system/src/hooks/useTreeshakeHack'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { BadRequestError } from '@proofzero/errors'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useHydrated } from 'remix-utils'
import { getCurrentAndUpcomingInvoices } from './utils/billing'
import type { ServicePlanType } from '@proofzero/types/billing'
import { registerFeatureFlag } from '@proofzero/design-system/src/hooks/feature-flags'

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

export type AppLoaderData = {
  clientId: string
  name?: string
  icon?: string
  published?: boolean
  createdTimestamp?: number
  appPlan: ServicePlanType
  hasCustomDomain: boolean
  groupID?: string
  groupName?: string
}

export type LoaderData = {
  apps: AppLoaderData[]
  avatarUrl: string
  PASSPORT_URL: string
  displayName: string
  hasUnpaidInvoices: boolean
  unpaidInvoiceURL: string
  ENV: {
    POSTHOG_API_KEY: string
    POSTHOG_PROXY_HOST: string
    INTERNAL_GOOGLE_ANALYTICS_TAG: string
    REMIX_DEV_SERVER_WS_PORT?: number
    WALLET_CONNECT_PROJECT_ID: string
  }
  identityURN: IdentityURN
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    if (
      request.cf.botManagement.score <= 30 &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
    ) {
      return null
    }
    const jwt = await requireJWT(request, context.env)
    if (!jwt) {
      throw new BadRequestError({
        message: 'No JWT found in request.',
      })
    }
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const parsedJwt = parseJwt(jwt)
    const identityURN = parsedJwt.sub as IdentityURN

    try {
      const coreClient = createCoreClient(context.env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...traceHeader,
      })

      const [apps, groupApps] = await Promise.all([
        coreClient.starbase.listApps.query(),
        coreClient.starbase.listGroupApps.query(),
      ])

      const reshapedApps = [
        ...apps.map((a) => {
          return {
            clientId: a.clientId,
            name: a.app?.name,
            icon: a.app?.icon,
            published: a.published,
            createdTimestamp: a.createdTimestamp,
            appPlan: a.appPlan,
            hasCustomDomain: Boolean(a.customDomain),
          }
        }),
        ...groupApps.map((a) => ({
          clientId: a.clientId,
          name: a.app?.name,
          icon: a.app?.icon,
          published: a.published,
          createdTimestamp: a.createdTimestamp,
          appPlan: a.appPlan,
          hasCustomDomain: Boolean(a.customDomain),
          groupName: a.groupName,
          groupID: a.groupURN.split('/')[1],
        })),
      ].sort(
        (a, b) =>
          a.name!.localeCompare(b.name!) ||
          (a.createdTimestamp || 0) - (b.createdTimestamp || 0)
      )

      let avatarUrl = ''
      let displayName = ''
      try {
        const profile = await coreClient.identity.getProfile.query({
          identity: identityURN,
        })
        avatarUrl = profile?.pfp?.image || ''
        displayName = profile?.displayName || ''
      } catch (e) {
        console.error('Could not retrieve profile image.', e)
      }

      const {
        PASSPORT_URL,
        POSTHOG_PROXY_HOST,
        POSTHOG_API_KEY,
        INTERNAL_GOOGLE_ANALYTICS_TAG,
        WALLET_CONNECT_PROJECT_ID,
      } = context.env

      const spd = await coreClient.billing.getStripePaymentData.query({
        URN: identityURN,
      })

      // might be quite heavy object
      // for that reason I don't put it in outlet context
      const invoices = await getCurrentAndUpcomingInvoices(
        spd,
        context.env.SECRET_STRIPE_API_KEY
      )

      let unpaidInvoiceURL = '/billing/portal'

      let hasUnpaidInvoices = false
      try {
        hasUnpaidInvoices = invoices.some((invoice) => {
          if (invoice.status)
            if (['uncollectible', 'open'].includes(invoice.status)) {
              unpaidInvoiceURL = invoice.url as string
              return true
            }
          return false
        })
      } catch (e) {
        console.error('Could not retrieve invoices.', e)
      }

      return json<LoaderData>({
        apps: reshapedApps,
        avatarUrl,
        hasUnpaidInvoices,
        unpaidInvoiceURL,
        PASSPORT_URL,
        ENV: {
          POSTHOG_API_KEY,
          POSTHOG_PROXY_HOST,
          INTERNAL_GOOGLE_ANALYTICS_TAG,
          REMIX_DEV_SERVER_WS_PORT:
            process.env.NODE_ENV === 'development'
              ? +process.env.REMIX_DEV_SERVER_WS_PORT!
              : undefined,
          WALLET_CONNECT_PROJECT_ID,
        },
        displayName,
        identityURN,
      })
    } catch (error) {
      console.error({ error })
      return json({ error }, { status: 500 })
    }
  }
)

export const meta: MetaFunction = () => {
  return {
    charset: 'utf-8',
    title: 'Console - Rollup',
    viewport: 'width=device-width,initial-scale=1',
    'og:image':
      'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'og:description': 'Simple & Secure Private Auth',
    'og:title': 'Console - Rollup',
    'og:url': 'https://console.rollup.id',
    'twitter:card': 'summary_large_image',
    'twitter:site': '@rollupid_xyz',
    'twitter:creator': '@rollupid_xyz',
    'twitter:image':
      'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'theme-color': '#ffffff',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  }
}

export default function App() {
  const nonce = useContext(NonceContext)

  const transition = useTransition()
  const location = useLocation()
  const loaderData = useLoaderData() ?? {}

  const GATag = loaderData?.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  const remixDevPort = loaderData?.ENV.REMIX_DEV_SERVER_WS_PORT
  useTreeshakeHack(remixDevPort)

  const {
    apps,
    avatarUrl,
    PASSPORT_URL,
    displayName,
    identityURN,
    hasUnpaidInvoices,
    unpaidInvoiceURL,
  } = loaderData ?? {}

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  const hydrated = useHydrated()
  useEffect(() => {
    // https://posthog.com/docs/libraries/react#posthog-provider
    if (hydrated) {
      try {
        posthog?.init(loaderData.ENV.POSTHOG_API_KEY, {
          api_host: loaderData.ENV.POSTHOG_PROXY_HOST,
          autocapture: false,
        })
        posthog?.identify(identityURN)
      } catch (ex) {
        console.error(ex)
      }
    }
  }, [hydrated])

  registerFeatureFlag()

  const paymentFailedIGFetcher = useFetcher()
  useEffect(() => {
    paymentFailedIGFetcher.load('/api/payment-failed-identity-groups')
  }, [])

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {GATag && (
          <>
            {/* <!-- Google tag (gtag.js) --> */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GATag}`}
              nonce={nonce}
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
                  gtag('event', 'conversion', {'send_to': '${GATag}/x8scCNaPzMgYEPT6sYEq'});
              `,
              }}
              nonce={nonce}
            />
          </>
        )}
        {transition.state !== 'idle' ? <Loader /> : null}
        {typeof window !== 'undefined' ? (
          <PostHogProvider client={posthog}>
            <Outlet
              context={{
                apps,
                ENV: loaderData?.ENV ?? {},
                avatarUrl,
                PASSPORT_URL,
                displayName,
                identityURN,
                hasUnpaidInvoices,
                unpaidInvoiceURL,
                paymentFailedIG: paymentFailedIGFetcher.data ?? [],
              }}
            />
          </PostHogProvider>
        ) : (
          <Outlet
            context={{
              apps,
              ENV: loaderData?.ENV ?? {},
              avatarUrl,
              PASSPORT_URL,
              displayName,
              identityURN,
              hasUnpaidInvoices,
              unpaidInvoiceURL,
              paymentFailedIG: paymentFailedIGFetcher.data ?? [],
            }}
          />
        )}
        <ScrollRestoration nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              loaderData?.ENV ? loaderData.ENV : {}
            )}`,
          }}
        />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} port={remixDevPort} />
      </body>
    </html>
  )
}

// https://remix.run/docs/en/v1/guides/errors
// @ts-ignore
export function ErrorBoundary({ error }) {
  const nonce = useContext(NonceContext)

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
            pepe={false}
            backBtn={false}
          />
        </div>

        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload port={8002} nonce={nonce} />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.error('CaughtBoundary', JSON.stringify(caught, null, 2))

  const { status } = caught

  let secondary = 'Something went wrong'
  switch (status) {
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
      <body>
        <div
          className={
            'flex flex-col h-[100dvh] gap-4 justify-center items-center'
          }
        >
          <h1>{status}</h1>
          <p>
            {secondary}
            {caught.data?.message && `: ${caught.data?.message}`}
          </p>
          <p>({caught.data?.traceparent && `${caught.data?.traceparent}`})</p>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}
