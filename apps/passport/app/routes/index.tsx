import type { LinksFunction, MetaFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

import globalStyles from '@proofzero/design-system/src/styles/global.css'
import styles from '../styles/tailwind.css'
import { Meta } from '@remix-run/react'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: globalStyles },
]

export const loader: LoaderFunction = async ({ request }) => {
  // The lower the score, the more likely it is a bot
  // https://developers.cloudflare.com/bots/concepts/bot-score/
  if (
    request.cf.botManagement.score > 30 ||
    ['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
  ) {
    return redirect(`/settings`)
  } else return null
}

export const meta: MetaFunction = ({ data }) => {
  return {
    charset: 'utf-8',
    title: 'Passport - Rollup',
    viewport: 'width=device-width,initial-scale=1',
    'og:url': 'https://passport.rollup.id',
    'og:title': 'Passport - Rollup',
    'og:description': 'Simple & Secure Private Auth',
    'og:image':
      'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
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

// It doesn't go back to root file.
// Instead it looks for Meta function in this file.
export default function OGTheme() {
  return <Meta />
}
