import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import { isAddress as isEthAddress } from '@ethersproject/address'

import { Context } from '../../context'
import { NodeType } from '../../types'
import { isCryptoAddressType } from '../../utils'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { keccak256 } from '@ethersproject/keccak256'
import { CryptoAddressType } from '@kubelt/types/address'

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

  if (addrType && isCryptoAddressType(addrType)) {
    if (alias && alias.endsWith('.eth')) {
      const ensClient = new ENSUtils()
      const response = await ensClient.getEnsEntry(alias)
      const { address: ethAddress } = response

      const encoder = new TextEncoder()
      const idfUrn = IDRefURNSpace(CryptoAddressType.ETH).urn(ethAddress)
      const hash = keccak256(encoder.encode(idfUrn))

      if (hash !== hashedIdref) {
        throw `Alias ${alias} does not match ${hashedIdref}`
      }

      return next({
        ctx: {
          ...ctx,
          nodeType: NodeType.Crypto,
          alias: ethAddress,
          addressDescription: response,
        },
      })
    } else if (alias && isEthAddress(alias)) {
      return next({ ctx: { ...ctx, nodeType: NodeType.Crypto } })
    }
  }

  return next({ ctx })
}
