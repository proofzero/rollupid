import { EdgeSpace, EdgeURN } from '@kubelt/urns/edge'

export const HEADER_ACCESS_TOKEN = 'KBT-Access-JWT-Assertion'
//TODO: this should be converted to a platform-level urn, eg. com.kubelt/platform:starbase
export const STARBASE_API_KEY_ISSUER = 'starbase-app'

export const EDGE_APPLICATION: EdgeURN = EdgeSpace.urn('owns/app')
