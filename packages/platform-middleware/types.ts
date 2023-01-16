import { BaseContext } from '@kubelt/types'
import { MiddlewareFunction, ProcedureParams } from '@trpc/server'

export type BaseMiddlewareFunction<$ContextIn extends BaseContext> =
  MiddlewareFunction<
    {
      _ctx_out: $ContextIn
    } & ProcedureParams,
    ProcedureParams
  >
