import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useTransition,
  useLoaderData,
  useCatch,
} from '@remix-run/react'

import { useEffect } from 'react'

import designStyles from '@kubelt/design-system/src/styles/global.css'
import styles from '~/styles/tailwind.css'
import baseStyles from '~/styles/base.css'

import appleIcon from '~/assets/apple-touch-icon.png'
import icon32 from '~/assets/favicon-32x32.png'
import icon16 from '~/assets/favicon-16x16.png'
import faviconSvg from '~/assets/favicon.svg'
import social from '~/assets/social.png'
import maskIcon from '~/assets/safari-pinned-tab.svg'
import logo from '~/assets/rollup-id-logo.svg'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'

import * as gtag from '~/utils/gtags.client'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Profile',
  viewport: 'width=device-width,initial-scale=1',
  'og:title': 'Rollup - Decentralized Identity',
  'og:site_name': 'Rollup',
  'og:url': 'https://my.rollup.id',
  'og:description':
    'Rollup turns your blockchain accounts into multi-chain decentralized identities with improved auth, secure messaging and more.',
  // Hardcoded to not re-upload it every time
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@rollupid',
  'twitter:creator': '@rollupid',
  'theme-color': '#673ab8',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-capable': 'yes',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: designStyles },
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: baseStyles },
  { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
  { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
  { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
  { rel: 'mask-icon', href: maskIcon, color: '#5bbad5' },
  { rel: 'shortcut icon', type: 'image/svg+xml', href: faviconSvg },
]

export const loader: LoaderFunction = async ({ request }) => {
  return json({
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG,
      PASSPORT_URL,
      PROFILE_CLIENT_ID,
    },
  })
}

export default function App() {
  const location = useLocation()
  const { ENV } = useLoaderData<{
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG: string
      PASSPORT_URL: string
      PROFILE_CLIENT_ID: string
    }
  }>()

  const transition = useTransition()
  const GATag = ENV.INTERNAL_GOOGLE_ANALYTICS_TAG

  useEffect(() => {
    if (GATag) {
      gtag.pageview(location.pathname, GATag)
    }
  }, [location, GATag])

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="relative">
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
        {(transition.state === 'loading' ||
          transition.state === 'submitting') && <Loader />}

        <Outlet context={{}} />

        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `!window ? null : window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}

// https://remix.run/docs/en/v1/guides/errors
// @ts-ignore
export function ErrorBoundary({ error }) {
  console.error('Error caught in root error boundary', { error })
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="error-screen">
        <div className="wrapper grid grid-row-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="rollupid" />
          </nav>

          <div className="col-span-3">
            <ErrorPage
              code="500"
              message="Something went terribly wrong!"
              trace={error?.stack}
              error={error}
            />
          </div>
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

  console.error('CAUGHT', { caught })
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
      <body className="error-screen">
        <div className="wrapper grid grid-row-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="rollupid" />
          </nav>

          <div className="col-span-3">
            <ErrorPage code={caught.status.toString()} message={secondary} />
          </div>
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}
