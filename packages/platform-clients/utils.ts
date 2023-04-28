import type { AnyRouter } from '@trpc/server'
import type { LoggerLinkOptions } from '@trpc/client/links/loggerLink'
import { TRACEPARENT_HEADER_NAME } from '@proofzero/platform-middleware/trace'

//tRPC doesn't expose the inner logger type directly; have to extract it this way
type loggerFunction = LoggerLinkOptions<AnyRouter>['logger']

export const trpcClientLoggerGenerator = (
  serviceName: string,
  headers?: Record<string, string>
): loggerFunction => {
  return (props) => {
    const traceparent = JSON.stringify({
      traceparent: headers ? headers[TRACEPARENT_HEADER_NAME] : '',
    })

    if (props.direction === 'up')
      console.debug(
        `Starting tRPC client call ${serviceName} ${props.path} call ${props.id}`,
        traceparent
      )
    else
      console.debug(
        `Completed tRPC client call ${serviceName} ${props.path} call ${props.id}`,
        traceparent
      )
  }
}
