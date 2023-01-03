import { appRouter as accountRouter } from '@kubelt/platform/account/src/jsonrpc/router'
import { appRouter as pingRouter } from '@kubelt/platform/ping/src/jsonrpc/router'

export type AccountRouter = typeof accountRouter

export type PingRouter = typeof pingRouter
