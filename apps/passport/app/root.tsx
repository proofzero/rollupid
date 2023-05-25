import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'

import { json, redirect } from '@remix-run/cloudflare'

import { useContext, useEffect } from 'react'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
  useTransition,
  useLoaderData,
} from '@remix-run/react'

import { RollupIdButton } from '~/components'

import globalStyles from '@proofzero/design-system/src/styles/global.css'
import styles from './styles/tailwind.css'

import appleIcon from '~/assets/root-apple-touch-icon.png'
import icon32 from '~/assets/root-favicon-32x32.png'
import icon16 from '~/assets/root-favicon-16x16.png'
import faviconSvg from '~/assets/root-favicon.svg'
import social from '~/assets/passport-social.png'

import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { ErrorPage } from '@proofzero/design-system/src/pages/error/ErrorPage'

import {
  FLASH_MESSAGE_KEY,
  FLASH_MESSAGE_VALUES,
} from './utils/flashMessage.server'
import type { FLASH_MESSAGE } from './utils/flashMessage.server'

import { getFlashSession, commitFlashSession } from './session.server'

import {
  toast,
  Toaster,
  ToastType,
} from '@proofzero/design-system/src/atoms/toast'

import * as gtag from '~/utils/gtags.client'

import { NonceContext } from '@proofzero/design-system/src/atoms/contexts/nonce-context'
import useTreeshakeHack from '@proofzero/design-system/src/hooks/useTreeshakeHack'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Passport - Rollup',
  viewport: 'width=device-width,initial-scale=1',
  'og:url': 'https://passport.rollup.id',
  'og:description': 'Identity management for the private web.',
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@rollupid_xyz',
  'twitter:creator': '@rollupid_xyz',
  'theme-color': '#ffffff',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-capable': 'yes',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
]

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const url = new URL(request.url)
    /**
     * We use the same technique in profile for `$type/$address` route.
     * This redirect here prevents us from calling this loader multiple times.
     * In this case it's essential since flashSessions gets wiped out without
     * displaying toast messages.
     */

    if (url.pathname === `/`) {
      return redirect(`/authenticate`)
    }

    const flashes = []
    const flashSession = await getFlashSession(request, context.env)
    const flashMessageType = flashSession.get(
      FLASH_MESSAGE_KEY
    ) as FLASH_MESSAGE
    if (flashMessageType) {
      flashes.push({
        type: ToastType.Info,
        message: FLASH_MESSAGE_VALUES[flashMessageType],
      })
    }

    return json(
      {
        flashes,
        ENV: {
          PROFILE_APP_URL: context.env.PROFILE_APP_URL,
          INTERNAL_GOOGLE_ANALYTICS_TAG:
            context.env.INTERNAL_GOOGLE_ANALYTICS_TAG,
          APIKEY_ALCHEMY_PUBLIC: context.env.APIKEY_ALCHEMY_PUBLIC,
          REMIX_DEV_SERVER_WS_PORT:
            process.env.NODE_ENV === 'development'
              ? process.env.REMIX_DEV_SERVER_WS_PORT
              : undefined,
        },
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(
            request,
            context.env,
            flashSession
          ),
        },
      }
    )
  }
)

export default function App() {
  const nonce = useContext(NonceContext)

  const location = useLocation()
  const transition = useTransition()
  const browserEnv = useLoaderData()

  const GATag = browserEnv.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  const remixDevPort = browserEnv.ENV.REMIX_DEV_SERVER_WS_PORT
  useTreeshakeHack(remixDevPort)

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  useEffect(() => {
    browserEnv.flashes?.forEach(
      (flash: { type: ToastType; message: string }) => {
        toast(flash.type, {
          message: flash.message,
        })
      }
    )
  }, [browserEnv.flashes])

  return (
    <html lang="en">
      <head>
        <Meta />

        {browserEnv.appProps ? (
          <link rel="icon" type="image" href={browserEnv.appProps.iconURL} />
        ) : (
          <>
            <link rel="apple-touch-icon" href={appleIcon} sizes="180x180" />
            <link rel="shortcut icon" type="image/svg+xml" href={faviconSvg} />
            <link rel="icon" type="image/png" href={icon32} sizes="32x32" />
            <link rel="icon" type="image/png" href={icon16} sizes="16x16" />
          </>
        )}

        <Links />
      </head>
      <body style={{ backgroundColor: '#F9FAFB' }}>
        {!GATag ? null : (
          <>
            <script
              async
              nonce={nonce}
              src={`https://www.googletagmanager.com/gtag/js?id=${GATag}`}
            />
            <script
              nonce={nonce}
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
        {transition.state !== 'idle' && <Loader />}
        <Toaster position="top-right" />
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              browserEnv.ENV
            )}`,
          }}
        />
        <LiveReload nonce={nonce} port={remixDevPort} />
        <script
          async
          nonce={nonce}
          src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"
        ></script>
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
  console.error('CaughtBoundary', caught)

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
          {caught.data?.isAuthenticated && (
            <RollupIdButton
              text={'Continue to Rollup'}
              href={typeof window !== 'undefined' && window.ENV.PROFILE_APP_URL}
            />
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}
