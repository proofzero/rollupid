import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context } from './context'
import router from './router'
import relay, { type CloudflareEmailMessage } from './relay'
import {
  DelQueueMessageType,
  type DelQueueMessage,
  type Environment,
} from './types'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { initAuthorizationNodeByName } from '@proofzero/platform.authorization/src/nodes'
import { getApplicationNodeByClientId } from '@proofzero/platform.starbase/src/nodes/application'
import { InternalServerError } from '@proofzero/errors'

export { Account } from '@proofzero/platform.account'
export { Identity, IdentityGroup } from '@proofzero/platform.identity'
export { Authorization, ExchangeCode } from '@proofzero/platform.authorization'
export { StarbaseApplication } from '@proofzero/platform.starbase'

export default {
  async fetch(
    request: Request,
    env: Environment,
    ctx: ExecutionContext
  ): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router,
      onError,
      createContext: (
        opts: FetchCreateContextFnOptions & {
          // It doesn't exist on native tRPC types, so we can't force it here
          waitUntil?: (promise: Promise<unknown>) => void
        }
      ) => {
        Object.assign(opts, { waitUntil: ctx.waitUntil.bind(ctx) })
        return createContext(opts, env)
      },
    })
  },
  async email(message: CloudflareEmailMessage, env: Environment) {
    const decoder = new TextDecoder()
    const reader = message.raw.getReader()

    let content = ''
    let { done, value } = await reader.read()
    while (!done) {
      content += decoder.decode(value)
      ;({ done, value } = await reader.read())
    }

    return relay(content, env)
  },
  async queue(
    batch: MessageBatch<DelQueueMessage>,
    env: Environment,
    ctx: ExecutionContext
  ): Promise<void> {
    const asyncFn = async () => {
      if (
        batch.messages.length === 1 &&
        batch.messages[0].body.type === DelQueueMessageType.SPECIALSAUCE
      ) {
        for (const clientID of batch.messages[0].body.data.appIDSet) {
          const appDO = await getApplicationNodeByClientId(
            clientID,
            env.StarbaseApp
          )

          const { externalAppDataPackageDefinition } =
            await appDO.class.getDetails()
          if (!externalAppDataPackageDefinition) {
            console.warn('External app data package definition not found')
          } else if (externalAppDataPackageDefinition.status !== 'deleting') {
            console.warn(
              'External app data package definition not marked for deletion'
            )
          }

          await appDO.storage.delete('externalAppDataPackageDefinition')
        }
        batch.messages[0].ack()

        console.info(
          'HDU marked for status reset',
          JSON.stringify(
            {
              appIds: batch.messages[0].body.data.appIDSet.join(', '),
            },
            null,
            2
          )
        )
        return
      }

      let appIDSet = new Set<string>()
      for (const msg of batch.messages) {
        if (msg.body.type === DelQueueMessageType.SPECIALSAUCE) {
          appIDSet = new Set([...appIDSet, ...msg.body.data.appIDSet])
        }
      }

      if (appIDSet.size > 0) {
        const msgToSet: DelQueueMessage = {
          type: DelQueueMessageType.SPECIALSAUCE,
          data: {
            appIDSet: Array.from(appIDSet),
          },
        }
        await env.SYNC_QUEUE.send(msgToSet)
      }

      for (const msg of batch.messages) {
        if (msg.body.type === DelQueueMessageType.SPECIALSAUCE) {
          msg.ack()
          continue
        }

        try {
          const { appID, athID } = msg.body.data

          const nss = `${appID}@${athID}`
          const urn = AuthorizationURNSpace.componentizedUrn(nss)
          const node = initAuthorizationNodeByName(urn, env.Authorization)
          await node.storage.delete('externalAppData')

          console.log('Deleted app data')

          msg.ack()
        } catch (ex) {
          msg.retry()
        }
      }
    }

    ctx.waitUntil(asyncFn())
  },
}

export { router, type Context, type Environment }
