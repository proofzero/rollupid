import type { AnyRouter } from '@trpc/server'
import type { LoggerLinkOptions } from '@trpc/client/links/loggerLink'

//tRPC doesn't expose the inner logger type directly; have to extract it this way
type loggerFunction = LoggerLinkOptions<AnyRouter>['logger']

export const trpcClientLoggerGenerator = (
  serviceName: string
): loggerFunction => {
  return (props) => {
    if (props.direction === 'down')
      console.debug(
        `TRACE: T${Date.now()} Completed tRPC ${serviceName} ${
          props.path
        } call ${props.id} in ${props.elapsedMs} ms`
      )
    else
      console.debug(
        `TRACE: T${Date.now()} Starting tRPC ${serviceName} ${
          props.path
        } call ${props.id}...`
      )
  }
}
