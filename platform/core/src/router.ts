import { router } from './trpc'

import { appRouter as address } from '@proofzero/platform.address/src/jsonrpc/router'
import { appRouter as access } from '@proofzero/platform.access/src/jsonrpc/router'
import { appRouter as account } from '@proofzero/platform.account/src/jsonrpc/router'
import { appRouter as edges } from '@proofzero/platform.edges/src/jsonrpc/router'
import { appRouter as starbase } from '@proofzero/platform.starbase/src/jsonrpc/router'

export const coreRouter = router({
  address,
  access,
  account,
  edges,
  starbase,
})

export type CoreRouter = typeof coreRouter
export default coreRouter
