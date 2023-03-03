import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'

import { json } from '@remix-run/cloudflare'

import { useEffect } from 'react'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useParams,
  useLocation,
  useTransition,
  useLoaderData,
} from '@remix-run/react'

import { RollupIdButton } from '~/components'

import globalStyles from '@kubelt/design-system/src/styles/global.css'
import styles from './styles/tailwind.css'

import appleIcon from '~/assets/apple-touch-icon.png'
import icon32 from '~/assets/favicon-32x32.png'
import icon16 from '~/assets/favicon-16x16.png'
import faviconSvg from '~/assets/favicon.svg'
import social from '~/assets/passport-social.png'

import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'
import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

import {
  toast,
  Toaster,
  ToastType,
} from '@kubelt/design-system/src/atoms/toast'

import * as gtag from '~/utils/gtags.client'
import {
  commitFlashSession,
  getConsoleParamsSession,
  getFlashSession,
  setConsoleParamsSession,
} from './session.server'
import { getStarbaseClient } from './platform.server'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Rollup - Passport',
  viewport: 'width=device-width,initial-scale=1',
  'og:url': 'https://passport.rollup.id',
  'og:description': 'User identity in your control.',
  // Hardcoded to not re-upload it every time
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@rollupid_xyz',
  'twitter:creator': '@rollupid_xyz',
  'theme-color': '#673ab8',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-capable': 'yes',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
]

export const loader: LoaderFunction = async ({ request, context }) => {
  const flashes = []
  const flashSession = await getFlashSession(request, context.env)
  if (flashSession.get('SIGNOUT')) {
    flashes.push({
      type: ToastType.Info,
      message: "You've been signed out",
    })
  }

  const consoleParmamsSessionFromCookie = await getConsoleParamsSession(
    request,
    context.env
  )
  const consoleParamsSession = consoleParmamsSessionFromCookie.get('params')
  const parsedParams = consoleParamsSession
    ? await JSON.parse(consoleParamsSession)
    : undefined
  let clientId = parsedParams?.clientId || undefined

  // If we have a new clientId incoming
  // that is different from what we have
  // stored in cookie
  if (
    context.consoleParams.clientId &&
    context.consoleParams.clientId !== clientId
  ) {
    // Update the cookie with new clientId
    await setConsoleParamsSession(context.consoleParams, context.env)

    // And use the new clientId to query starbase
    clientId = context.consoleParams.clientId
  }

  let appProps
  if (clientId) {
    const sbClient = getStarbaseClient('', context.env)
    appProps = await sbClient.getAppPublicProps.query({ clientId })
  }

  return json(
    {
      flashes,
      appProps,
      ENV: {
        PROFILE_APP_URL: context.env.PROFILE_APP_URL,
        INTERNAL_GOOGLE_ANALYTICS_TAG:
          context.env.INTERNAL_GOOGLE_ANALYTICS_TAG,
        APIKEY_ALCHEMY_PUBLIC: context.env.APIKEY_ALCHEMY_PUBLIC,
      },
    },
    {
      headers: {
        'Set-Cookie': await commitFlashSession(context.env, flashSession),
      },
    }
  )
}

export default function App() {
  const location = useLocation()
  const transition = useTransition()
  const browserEnv = useLoaderData()

  const GATag = browserEnv.ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

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
        {transition.state === 'loading' && <Loader />}
        <Toaster position="top-right" />
        <Outlet
          context={{
            appProps: browserEnv.appProps,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              browserEnv.ENV
            )}`,
          }}
        />
        <LiveReload />
        <script
          async
          src="https://unpkg.com/flowbite@1.5.4/dist/flowbite.js"
        ></script>
      </body>
    </html>
  )
}

// https://remix.run/docs/en/v1/guides/errors
// @ts-ignore
export function ErrorBoundary({ error }) {
  console.error('Error in error boundary', error)

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

        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.error('Caught in catch boundary', caught)
  const params = useParams()
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
          className={'flex flex-col h-screen gap-4 justify-center items-center'}
        >
          <h1>{status}</h1>
          <p>
            {secondary}
            {caught.data?.message && `: ${caught.data?.message}`}
          </p>
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
