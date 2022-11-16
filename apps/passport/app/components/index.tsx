import { LinksFunction } from '@remix-run/cloudflare'

import { links as connectButtonLinks } from '~/components/connect-button/ConnectButton'

export const links: LinksFunction = () => [...connectButtonLinks()]

export * from './connect-button/ConnectButton'
export * from './threeid-button/ThreeIdButton'
export * from './authentication/Authentication'
