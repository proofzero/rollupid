import type { MetaFunction, LinksFunction } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

// import styles from './styles/global.css'
import styles from './styles/tailwind.css'
import globalStyles from '@kubelt/design-system/dist/index.css'
import { links as componentLinks } from '~/components'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
})

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
  // { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
  // { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
  // { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
  // { rel: 'mask-icon', href: maskIcon, color: '#5bbad5' },
  // { rel: 'shortcut icon', type: 'image/svg+xml', href: faviconSvg },
  ...componentLinks(),
  // ...headNavLink(),
]

export default function App() {
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
        <LiveReload />
      </body>
    </html>
  )
}
