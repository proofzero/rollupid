import { router } from './trpc'

import { appRouter as account } from '@proofzero/platform.account/src/jsonrpc/router'
import { appRouter as authorization } from '@proofzero/platform.authorization/src/jsonrpc/router'
import { appRouter as edges } from '@proofzero/platform.edges/src/jsonrpc/router'
import { appRouter as identity } from '@proofzero/platform.identity/src/jsonrpc/router'
import { appRouter as starbase } from '@proofzero/platform.starbase/src/jsonrpc/router'
import { appRouter as billing } from '@proofzero/platform.billing/src/jsonrpc/router'

export const coreRouter = router({
  account,
  authorization,
  edges,
  identity,
  starbase,
  billing,
})

export type CoreRouter = typeof coreRouter
export default coreRouter
