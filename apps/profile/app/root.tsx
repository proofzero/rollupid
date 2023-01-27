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
import styles from './styles/tailwind.css'
import baseStyles from './styles/base.css'

import social from './assets/social.png'
import appleIcon from './assets/apple-touch-icon.png'
import icon32 from './assets/favicon-32x32.png'
import icon16 from './assets/favicon-16x16.png'
import faviconSvg from './assets/favicon.svg'
import maskIcon from './assets/safari-pinned-tab.svg'
import logo from './assets/three-id-logo.svg'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'
import type { GetProfileQuery } from '@kubelt/galaxy-client'

import HeadNav, { links as headNavLink } from '~/components/head-nav'

import * as gtag from '~/utils/gtags.client'
import { getProfileSession } from './utils/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { getGalaxyClient } from './helpers/clients'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { getRedirectUrlForProfile } from './utils/redirects.server'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: '3ID',
  viewport: 'width=device-width,initial-scale=1',
  'og:title': '3ID - Decentralized Identity',
  'og:site_name': '3ID',
  'og:url': 'https://my.threeid.xyz',
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

export const loader: LoaderFunction = async ({ request }) => {
  // let's fetch the user profile if they are logged in
  const session = await getProfileSession(request)
  const user = session.get('user')

  const galaxyClient = await getGalaxyClient()
  let loggedInUserProfile = undefined
  let basePath = undefined
  if (user) {
    const {
      user: { accessToken: jwt },
    } = session.data
    loggedInUserProfile = await galaxyClient
      .getProfile(
        {},
        {
          [PlatformJWTAssertionHeader]: jwt,
        }
      )
      .then((res) => res.profile)
      .catch((err) => {
        return null
      })

    if (!loggedInUserProfile)
      throw new Error('Could not retrieve logged in use profile.')

    basePath = getRedirectUrlForProfile(loggedInUserProfile)
  }

  console.log({ loggedInUserProfile })

  return json({
    loggedInUserProfile,
    basePath,
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG,
      CONSOLE_APP_URL,
    },
  })
}

export default function App() {
  const location = useLocation()
  const { ENV, loggedInUserProfile, basePath } = useLoaderData<{
    ENV: {
      INTERNAL_GOOGLE_ANALYTICS_TAG: string
      CONSOLE_APP_URL: string
    }
    loggedInUserProfile: GetProfileQuery['profile'] | null
    basePath: string | undefined
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
      <body>
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
        <div className="bg-white h-full min-h-screen overflow-visible">
          <div
            className="header lg:px-4"
            style={{
              backgroundColor: '#192030',
            }}
          >
            <HeadNav
              consoleURL={ENV.CONSOLE_APP_URL}
              loggedIn={!!loggedInUserProfile}
              basePath={basePath}
              avatarUrl={loggedInUserProfile?.pfp?.image as string}
            />
          </div>

          <Outlet
            context={{
              loggedInUserProfile,
            }}
          />
        </div>
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
  console.debug('ERROR', { error })
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

  console.debug('CAUGHT', { caught })
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
            <img src={logo} alt="threeid" />
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
