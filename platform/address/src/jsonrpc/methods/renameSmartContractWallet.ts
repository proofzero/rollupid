import { z } from 'zod'

import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import createEdgesClient from '@proofzero/platform-clients/edges'
import { initAddressNodeByName } from '../../nodes'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { EDGE_ADDRESS } from '../../constants'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const RenameSmartContractWalletInput = z.object({
  nickname: z.string(),
  addressURN: AddressURNInput,
})

type RenameSmartContractWalletInput = z.infer<
  typeof RenameSmartContractWalletInput
>

export const renameSmartContractWalletMethod = async ({
  input,
  ctx,
}: {
  input: RenameSmartContractWalletInput
  ctx: Context
}) => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()

  if (!account) {
    throw new Error('missing account')
  }

  const smartContractWalletNode = initAddressNodeByName(
    input.addressURN,
    ctx.Address
  )

  // const address = await smartContractWalletNode.class.getAddress()

  // const newAddressURN = AddressURNSpace.componentizedUrn(
  //   generateHashedIDRef(CryptoAddressType.Wallet, address!),
  //   {
  //     node_type: NodeType.Crypto,
  //     addr_type: CryptoAddressType.Wallet,
  //   },
  //   { alias: input.nickname, hidden: 'true' }
  // )

  // const edgesClient = createEdgesClient(ctx.Edges, {
  //   ...generateTraceContextHeaders(ctx.traceSpan),
  // })

  // await edgesClient.makeEdge.mutate({
  //   src: account,
  //   dst: newAddressURN,
  //   tag: EDGE_ADDRESS,
  // })

  await smartContractWalletNode.class.setNickname(input.nickname)
}
