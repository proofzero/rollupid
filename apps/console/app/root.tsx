/**
 * @file app/root.tsx
 */

import type { LinksFunction, MetaFunction } from '@remix-run/cloudflare'

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import globalStyles from '@kubelt/design-system/src/styles/global.css'
import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStyles },

    { rel: 'icon', href: '/favicon.ico' },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Starbase',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
