import type { MetaFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async () => {
  return redirect(`/settings`)
}

export const meta: MetaFunction = ({ data }) => {
  return {
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
