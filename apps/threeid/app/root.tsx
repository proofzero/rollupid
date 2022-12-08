import type {
  MetaFunction,
  LinksFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import { useLoaderData, useCatch } from '@remix-run/react'

import { startSession } from '~/utils/datadog.client'

import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'

import designStyles from '@kubelt/design-system/src/styles/global.css'
import styles from './styles/tailwind.css'
import baseStyles from './styles/base.css'

import social from './assets/social.png'
import appleIcon from './assets/apple-touch-icon.png'
import icon32 from './assets/favicon-32x32.png'
import icon16 from './assets/favicon-16x16.png'
import faviconSvg from './assets/favicon.svg'
import maskIcon from './assets/safari-pinned-tab.svg'
import pepe from './assets/pepe.svg'
import logo from './assets/three-id-logo.svg'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

import HeadNav, { links as headNavLink } from '~/components/head-nav'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: '3ID',
  viewport: 'width=device-width,initial-scale=1',
  'og:title': '3ID - Decentralized Identity',
  'og:site_name': '3ID',
  'og:url': 'https://3id.kubelt.com',
  'og:description':
    '3ID turns your blockchain accounts into multi-chain decentralized identities with improved auth, secure messaging and more.',
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@threeid_xyz',
  'twitter:creator': '@threeid_xyz',
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
  ...headNavLink(),
]

export const loader: LoaderFunction = () => {
  return json({
    ENV: {
      DATADOG_APPLICATION_ID: DATADOG_APPLICATION_ID,
      DATADOG_CLIENT_TOKEN: DATADOG_CLIENT_TOKEN,
      DATADOG_SERVICE_NAME: DATADOG_SERVICE_NAME,
      DATADOG_ENV: DATADOG_ENV,
    },
  })
}

export default function App() {
  const browserEnv = useLoaderData()
  typeof window !== 'undefined' && startSession()

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
        <LiveReload port={8002} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(browserEnv.ENV)}`,
          }}
        />
      </body>
    </html>
  )
}

// https://remix.run/docs/en/v1/guides/errors
// @ts-ignore
export function ErrorBoundary({ error }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body className="error-screen">
        <div className="wrapper grid grid-row-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="threeid" />
          </nav>

          <div className="col-span-3">
            <ErrorPage
              code="500"
              message="Something went terribly wrong!"
              trace={error?.stack}
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
      <body className="error-screen bg-white h-full min-h-screen">
        <div
          style={{
            backgroundColor: '#192030',
          }}
        >
          <HeadNav
            loggedIn={caught.data?.loggedIn}
            avatarUrl={caught.data?.loggedInUserProfile?.pfp?.image}
            isToken={caught.data?.loggedInUserProfile?.pfp?.isToken}
          />
        </div>
        <div
          className="wrapper grid grid-row-3 gap-4"
          style={{ marginTop: '-128px' }}
        >
          <article className="content col-span-3">
            <div className="error justify-center items-center">
              <p className="error-message text-center">{caught.status}</p>
              <p className="error-secondary-message text-center">{secondary}</p>
            </div>
            <div className="relative -mr-20">
              <img alt="pepe" className="m-auto pb-12" src={pepe} />
            </div>
          </article>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  )
}
