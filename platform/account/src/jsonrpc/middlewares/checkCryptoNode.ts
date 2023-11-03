import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { isAddress as isEthAddress } from '@ethersproject/address'

import { NodeType } from '@proofzero/types/account'

import { Context } from '../../context'
import { isCryptoAccountType } from '../../utils'
import ENSUtils from '@proofzero/platform-clients/ens-utils'
import { CryptoAccountType } from '@proofzero/types/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'

export const checkCryptoNodes: BaseMiddlewareFunction<Context> = async ({
  next,
  ctx,
}) => {
  const nodeType = ctx.nodeType
  console.log('checkCryptoNodes: nodeType', nodeType)
  if (
    nodeType &&
    nodeType != NodeType.Crypto &&
    nodeType != NodeType.Contract
  ) {
    return next({ ctx })
  }

  const alias = ctx.alias
  const hashedIdref = ctx.hashedIdref as string // TODO: when hash is introduced, this will be replaced with qparam for cleartext address
  const addrType = ctx.addrType

  console.log('checkCryptoNodes: addrType', addrType)

  if (addrType && isCryptoAccountType(addrType)) {
    if (alias && alias.endsWith('.eth')) {
      const ensClient = new ENSUtils()
      const response = await ensClient.getEnsEntry(alias)
      if (!response) return next({ ctx })

      const { address: ethAddress } = response
      const hash = generateHashedIDRef(CryptoAccountType.ETH, ethAddress)

      if (hash !== hashedIdref) {
        throw `Alias ${alias} does not match ${hashedIdref}`
      }

      return next({
        ctx: {
          ...ctx,
          nodeType: NodeType.Crypto,
          alias: ethAddress,
          accountDescription: response,
        },
      })
    } else if (alias && isEthAddress(alias)) {
      return next({ ctx: { ...ctx, nodeType: NodeType.Crypto } })
    }
  }

  return next({ ctx })
}
