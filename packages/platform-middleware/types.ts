import { MiddlewareFunction, ProcedureParams } from '@trpc/server'

export type BaseMiddlewareFunction<$ContextIn> = MiddlewareFunction<
  {
    _ctx_out: $ContextIn
  } & ProcedureParams,
  ProcedureParams
>
