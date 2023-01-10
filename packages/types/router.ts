import { appRouter as accountRouter } from '@kubelt/platform/account/src/jsonrpc/router'
import { appRouter as accessRouter } from '@kubelt/platform/access/src/jsonrpc/router'
import { appRouter as addressRouter } from '@kubelt/platform/address/src/jsonrpc/router'
import { appRouter as edgesRouter } from '@kubelt/platform/edges/src/jsonrpc/router'
import { appRouter as pingRouter } from '@kubelt/platform/ping/src/jsonrpc/router'
import { appRouter as objectRouter } from '@kubelt/platform/object/src/jsonrpc/router'
import { appRouter as starbaseRouter } from '@kubelt/platform/starbase/src/jsonrpc/router'

export type AccountRouter = typeof accountRouter

export type AccessRouter = typeof accessRouter

export type AddressRouter = typeof addressRouter

export type EdgesRouter = typeof edgesRouter

export type PingRouter = typeof pingRouter

export type ObjectRouter = typeof objectRouter

export type StarbaseRouter = typeof starbaseRouter
