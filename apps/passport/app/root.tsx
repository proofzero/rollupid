import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/cloudflare'

import { json } from '@remix-run/cloudflare'

import { useContext, useEffect, useState } from 'react'

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
  Link,
  useFetchers,
} from '@remix-run/react'

import { RollupIdButton } from '~/components'

import globalStyles from '@proofzero/design-system/src/styles/global.css'
import styles from './styles/tailwind.css'

import appleIcon from '~/assets/root-apple-touch-icon.png'
import icon32 from '~/assets/root-favicon-32x32.png'
import icon16 from '~/assets/root-favicon-16x16.png'
import faviconSvg from '~/assets/root-favicon.svg'
import LogoIndigo from '~/assets/PassportLogoIndigo.svg'

import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { ErrorPage } from '@proofzero/design-system/src/pages/error/ErrorPage'

import {
  FLASH_MESSAGE_KEY,
  FLASH_MESSAGE_VALUES,
} from './utils/flashMessage.server'
import type { FLASH_MESSAGE } from './utils/flashMessage.server'

import { getFlashSession, commitFlashSession } from './session.server'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import {
  toast,
  Toaster,
  ToastType,
} from '@proofzero/design-system/src/atoms/toast'

import * as gtag from '~/utils/gtags.client'

import { NonceContext } from '@proofzero/design-system/src/atoms/contexts/nonce-context'
import useTreeshakeHack from '@proofzero/design-system/src/hooks/useTreeshakeHack'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { useHydrated } from 'remix-utils'

import { getCoreClient } from './platform.server'
import { Button } from '@proofzero/design-system'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
]

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const clientId = new URL(request.url).searchParams.get('client_id')
    if (
      // @ts-ignore :(
      request.cf &&
      // @ts-ignore :(
      request.cf.botManagement.score <= 30 &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
    ) {
      let ogTheme = {}
      if (
        (params.clientId || clientId) &&
        !['console', 'passport'].includes(params.clientId!)
      ) {
        const coreClient = getCoreClient({ context })
        ogTheme = await coreClient.starbase.getOgTheme.query({
          clientId: params.clientId!,
        })
      }

      return json(ogTheme)
    }
    let appProps
    if (context.appProps) {
      appProps = context.appProps
    } else {
      if (!params.clientId && !clientId) {
        const name = 'Passport'
        appProps = {
          name: `Rollup - ${name}`,
          iconURL: LogoIndigo,
          termsURL: 'https://rollup.id/tos',
          privacyURL: 'https://rollup.id/privacy-policy',
          redirectURI: `https://passport.rollup.id`,
          websiteURL: 'https://rollup.id',
        }
      } else {
        if (
          ['console', 'passport'].includes(params.clientId!) ||
          (clientId && ['console', 'passport'].includes(clientId))
        ) {
          const effectiveClientId = params.clientId! ?? clientId
          const name =
            effectiveClientId.charAt(0).toUpperCase() +
            effectiveClientId.slice(1)
          appProps = {
            name: `Rollup - ${name}`,
            iconURL: LogoIndigo,
            termsURL: 'https://rollup.id/tos',
            privacyURL: 'https://rollup.id/privacy-policy',
            redirectURI: `https://${effectiveClientId}.rollup.id`,
            websiteURL: 'https://rollup.id',
          }
        } else {
          const coreClient = getCoreClient({ context })

          const rollupAction = new URL(request.url).searchParams.get(
            'rollup_action'
          )

          appProps = await coreClient.starbase.getAppPublicProps.query({
            clientId: (params.clientId || clientId) as string,
            previewMode: rollupAction === 'preview',
          })
        }
      }
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
        appProps: { ...appProps, clientId: params.clientId },
        flashes,
        ENV: {
          POSTHOG_API_KEY: context.env.POSTHOG_API_KEY,
          PROFILE_APP_URL: context.env.PROFILE_APP_URL,
          POSTHOG_PROXY_HOST: context.env.POSTHOG_PROXY_HOST,
          INTERNAL_GOOGLE_ANALYTICS_TAG:
            context.env.INTERNAL_GOOGLE_ANALYTICS_TAG,
          REMIX_DEV_SERVER_WS_PORT:
            process.env.NODE_ENV === 'development'
              ? process.env.REMIX_DEV_SERVER_WS_PORT
              : undefined,
          WALLET_CONNECT_PROJECT_ID: context.env.WALLET_CONNECT_PROJECT_ID,
          APIKEY_ALCHEMY_PUBLIC: context.env.APIKEY_ALCHEMY_PUBLIC,
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

export const meta: MetaFunction = ({ data }) => {
  return {
    charset: 'utf-8',
    title: data?.title ? data.title : 'Passport - Rollup',
    viewport: 'width=device-width,initial-scale=1',
    'og:url': 'https://passport.rollup.id',
    'og:title': data?.title ? data.title : 'Passport - Rollup',
    'og:description': data?.description
      ? data.description
      : 'Simple & Secure Private Auth',
    'og:image': data?.image
      ? data.image
      : 'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'twitter:card': 'summary_large_image',
    'twitter:site': '@rollupid_xyz',
    'twitter:creator': '@rollupid_xyz',
    'twitter:image': data?.image
      ? data.image
      : 'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'theme-color': '#ffffff',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  }
}

export default function App() {
  const nonce = useContext(NonceContext)

  const location = useLocation()
  const transition = useTransition()
  const browserEnv = useLoaderData() ?? {}

  const hydrated = useHydrated()

  const GATag = browserEnv?.ENV?.INTERNAL_GOOGLE_ANALYTICS_TAG

  const remixDevPort = browserEnv?.ENV?.REMIX_DEV_SERVER_WS_PORT
  useTreeshakeHack(remixDevPort)

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  useEffect(() => {
    browserEnv?.flashes?.forEach(
      (flash: { type: ToastType; message: string }) => {
        toast(flash.type, {
          message: flash.message,
        })
      }
    )
  }, [browserEnv?.flashes])

  const loaderColorHandler = (isDark: boolean): string | undefined => {
    if (browserEnv?.appProps?.appTheme?.color) {
      return isDark
        ? browserEnv?.appProps?.appTheme?.color.dark
        : browserEnv?.appProps.appTheme.color.light
    }
  }

  const [dark, setDark] = useState<boolean>(false)
  const [loaderColor, setLoaderColor] = useState<string | undefined>(
    browserEnv?.appProps?.appTheme?.color?.light
  )

  const [ueComplete, setUEComplete] = useState(false)
  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(darkMode.matches)
    setLoaderColor(loaderColorHandler(darkMode.matches))

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        setDark(event.matches)
        setLoaderColor(loaderColorHandler(event.matches))
      })
    setUEComplete(true)
  }, [])

  useEffect(() => {
    // https://posthog.com/docs/libraries/react#posthog-provider
    if (hydrated) {
      try {
        posthog?.init(browserEnv?.ENV.POSTHOG_API_KEY, {
          api_host: browserEnv?.ENV.POSTHOG_PROXY_HOST,
          autocapture: false,
        })
        posthog?.reset()
      } catch (ex) {
        console.error(ex)
      }
    }
  }, [hydrated])

  const fetchers = useFetchers()

  return (
    <html lang="en">
      <head>
        <Meta />

        {browserEnv?.appProps?.iconURL ? (
          <>
            <link
              rel="apple-touch-icon"
              href={browserEnv?.appProps.iconURL}
              sizes="180x180"
            />
            <link rel="icon" type="image" href={browserEnv?.appProps.iconURL} />
            <link
              rel="shortcut icon"
              type="image"
              href={browserEnv?.appProps.iconURL}
            />
          </>
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
      <body>
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
        {(transition.state !== 'idle' ||
          fetchers.some((f) => f.state !== 'idle')) && (
          <Loader mainColor={loaderColor} />
        )}
        <Toaster position="top-right" />
        {ueComplete && (
          <ThemeContext.Provider
            value={{
              dark,
              theme: undefined,
            }}
          >
            {typeof window !== 'undefined' ? (
              <PostHogProvider client={posthog}>
                <Outlet context={{ appProps: browserEnv?.appProps }} />
              </PostHogProvider>
            ) : (
              <Outlet context={{ appProps: browserEnv?.appProps }} />
            )}
          </ThemeContext.Provider>
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(
              browserEnv?.ENV ?? {}
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
        <section className="absolute right-0 top-0 p-4">
          <Link to="/signout" onClick={() => posthog?.reset()}>
            <Button type="button">Sign Out</Button>
          </Link>
        </section>

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
  const nonce = useContext(NonceContext)

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
          <section className="absolute right-0 top-0 p-4">
            <Link to="/signout" onClick={() => posthog?.reset()}>
              <Button type="button">Sign Out</Button>
            </Link>
          </section>

          <h1>{status}</h1>
          <p>
            {secondary}
            {caught.data?.message && `: ${caught.data?.message}`}
          </p>
          <p>({caught.data?.traceparent && `${caught.data?.traceparent}`})</p>
          {caught.data?.isAuthenticated && (
            <RollupIdButton
              text={'Continue to Rollup'}
              href={'https://rollup.id'}
            />
          )}
        </div>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload port={8002} nonce={nonce} />
      </body>
    </html>
  )
}
