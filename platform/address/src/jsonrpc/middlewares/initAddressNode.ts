import createImageClient from '@proofzero/platform-clients/image'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { Context } from '../../context'

export const initAddressNode: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  if (!ctx.address) return next({ ctx })
  const nodeClient = ctx.address
  const addressURN = ctx.addressURN
  const addrType = ctx.addrType
  if (!nodeClient) {
    throw new Error('missing node client')
  }

  if (!addressURN) {
    throw new Error('missing addressURN')
  }

  const address = await nodeClient.class.getAddress()
  const type = await nodeClient.class.getType()
  if (!address || !type) {
    if (!addrType || !ctx.nodeType) {
      throw new Error('missing addrType')
    }
    if (!ctx.alias) {
      throw new Error('missing alias')
    }
    const imageClient = createImageClient(ctx.Images, {
      headers: generateTraceContextHeaders(ctx.traceSpan),
    })
    const gradient = await imageClient.getGradient.mutate({
      gradientSeed: ctx.alias,
    })
    await nodeClient.class.setGradient(gradient)
    await nodeClient.class.setAddress(ctx.alias)
    await nodeClient.class.setType(addrType)
    await nodeClient.class.setNodeType(ctx.nodeType)
  }
  return next({ ctx })
}
