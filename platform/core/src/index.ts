import {
  fetchRequestHandler,
  FetchCreateContextFnOptions,
} from '@trpc/server/adapters/fetch'

import { serverOnError as onError } from '@proofzero/utils/trpc'

import { createContext, type Context, createContextInner } from './context'
import router from './router'
import relay, { type CloudflareEmailMessage } from './relay'
import {
  CoreQueueMessage,
  CoreQueueMessageType,
  type Environment,
} from './types'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { initAuthorizationNodeByName } from '@proofzero/platform.authorization/src/nodes'
import { getApplicationNodeByClientId } from '@proofzero/platform.starbase/src/nodes/application'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'
import { EDGE_AUTHORIZES } from '@proofzero/platform.authorization/src/constants'
import { IdentityURNSpace } from '@proofzero/urns/identity'

export { Account } from '@proofzero/platform.account'
export { Identity, IdentityGroup } from '@proofzero/platform.identity'
export { Authorization, ExchangeCode } from '@proofzero/platform.authorization'
export { StarbaseApplication } from '@proofzero/platform.starbase'

let ops = 0
let success = 0
let fail = 0

const errorMap = new Map()

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
    batch: MessageBatch<CoreQueueMessage>,
    env: Environment,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log({
      first:
        batch.messages[0]?.body.type ===
        CoreQueueMessageType.ExternalAppDataDelSignal
          ? 'SS'
          : batch.messages[0]?.body?.data?.athID,
      lastt:
        batch.messages[batch.messages.length - 1]?.body.type ===
        CoreQueueMessageType.ExternalAppDataDelReq
          ? // @ts-ignore
            batch.messages[batch.messages.length - 1]?.body?.data?.athID
          : batch.messages[batch.messages.length - 1]?.body.type ===
            CoreQueueMessageType.ExternalAppDataDelSignal
          ? 'SS'
          : undefined,
      batchLen: batch.messages.length,
    })

    const asyncFn = async () => {
      let appIDSet = new Set<string>()
      for (const msg of batch.messages) {
        if (msg.body.type === CoreQueueMessageType.ExternalAppDataDelSignal) {
          appIDSet = new Set([...appIDSet, ...msg.body.data.appIDSet])
        }
      }

      if (
        batch.messages.length === 1 &&
        batch.messages[0].body.type ===
          CoreQueueMessageType.ExternalAppDataDelSignal
      ) {
        console.log(
          JSON.stringify(
            {
              ops,
              success,
              fail,
              errorMap,
            },
            null,
            2
          )
        )
        const limit = 2000

        const clientIDSet = batch.messages[0].body.data.appIDSet
        const clientID = clientIDSet[0]

        const appDO = await getApplicationNodeByClientId(
          clientID,
          env.StarbaseApp
        )

        let queueQuery = await appDO.class.getQueueLimitAndOffset()
        if (!queueQuery) {
          queueQuery = {
            limit,
            offset: 0,
          }
          await appDO.class.setQueueLimitAndOffset(queueQuery)
        }

        const callerCTX = await createContextInner({
          env,
          waitUntil: ctx.waitUntil.bind(ctx),
        })
        const caller = router.createCaller(callerCTX)
        const { edges } = await caller.edges.getEdges({
          query: {
            tag: EDGE_AUTHORIZES,
            dst: {
              rc: {
                client_id: clientID,
              },
            },
          },
          opt: {
            limit: queueQuery.limit,
            offset: queueQuery.offset,
          },
        })

        if (edges && edges.length > 0) {
          console.log('Got edges')
          const queueMessages: MessageSendRequest<CoreQueueMessage>[] =
            edges.map((edge) => ({
              contentType: 'json',
              body: {
                type: CoreQueueMessageType.ExternalAppDataDelReq,
                data: {
                  appID: clientID,
                  athID: IdentityURNSpace.decode(edge.src.baseUrn),
                },
              },
            }))

          const queueMessageBatches = []
          while (queueMessages.length > 0) {
            queueMessageBatches.push(queueMessages.splice(0, 100))
          }

          for (const queueMessageBatch of queueMessageBatches) {
            await env.COREQUEUE.sendBatch(queueMessageBatch)
          }

          queueQuery.offset += queueQuery.limit
          await appDO.class.setQueueLimitAndOffset(queueQuery)
        } else {
          console.log("Didn't get edges")
          await appDO.class.setQueueLimitAndOffset(undefined)

          const { externalAppDataPackageDefinition } =
            await appDO.class.getDetails()
          if (!externalAppDataPackageDefinition) {
            console.warn('External app data package definition not found')
          } else if (
            externalAppDataPackageDefinition.status !==
            ExternalAppDataPackageStatus.Deleting
          ) {
            console.warn(
              'External app data package definition not marked for deletion'
            )
          }

          await appDO.storage.delete('externalAppDataPackageDefinition')
          appIDSet.delete(clientID)

          console.log(`Finished processing ${clientID}`)
        }
      }

      if (appIDSet.size > 0) {
        const msgToSet: CoreQueueMessage = {
          type: CoreQueueMessageType.ExternalAppDataDelSignal,
          data: {
            appIDSet: Array.from(appIDSet),
          },
        }
        await env.COREQUEUE.send(msgToSet)
      }

      for (const msg of batch.messages) {
        if (msg.body.type === CoreQueueMessageType.ExternalAppDataDelSignal) {
          msg.ack()
          continue
        }

        try {
          const { appID, athID } = msg.body.data

          try {
            const nss = `${appID}@${athID}`
            const urn = AuthorizationURNSpace.componentizedUrn(nss)

            const node = initAuthorizationNodeByName(urn, env.Authorization)
            await node.storage.delete('externalAppData')
            // await new Promise((ok) => setTimeout(ok, 5))
          } catch (ex) {
            console.log('FIRSTSTEPS')
            throw ex
          }

          msg.ack()
          success++
        } catch (ex) {
          fail++

          console.log(ex.name)
          console.log(ex.message)
          console.log(ex.cause)
          console.log(ex.stack)

          if (!errorMap.has((ex as Error).name)) {
            errorMap.set((ex as Error).name, new Set())
          }
          errorMap.get((ex as Error).name).add((ex as Error).message)

          msg.retry()
        } finally {
          ops++
        }
      }
    }

    ctx.waitUntil(asyncFn())
  },
}

export { router, type Context, type Environment }
