import coreRouter from '@proofzero/platform/core/src/router'
import { appRouter as accountRouter } from '@proofzero/platform/account/src/jsonrpc/router'
import { appRouter as authorizationRouter } from '@proofzero/platform/authorization/src/jsonrpc/router'
import { appRouter as identityRouter } from '@proofzero/platform/identity/src/jsonrpc/router'
import { appRouter as edgesRouter } from '@proofzero/platform/edges/src/jsonrpc/router'
import { appRouter as pingRouter } from '@proofzero/platform/ping/src/jsonrpc/router'
import { appRouter as objectRouter } from '@proofzero/platform/object/src/jsonrpc/router'
import { appRouter as starbaseRouter } from '@proofzero/platform/starbase/src/jsonrpc/router'
import { appRouter as imageRouter } from '@proofzero/platform/images/src/jsonrpc/router'
import { appRouter as emailRouter } from '@proofzero/platform/email/src/jsonrpc/router'

export type CoreRouter = typeof coreRouter

export type AccountRouter = typeof accountRouter

export type AuthorizationRouter = typeof authorizationRouter

export type IdentityRouter = typeof identityRouter

export type EdgesRouter = typeof edgesRouter

export type PingRouter = typeof pingRouter

export type ObjectRouter = typeof objectRouter

export type StarbaseRouter = typeof starbaseRouter

export type ImageRouter = typeof imageRouter

export type EmailRouter = typeof emailRouter
