import web3 from 'web3'

import { AddressURNSpace } from '@kubelt/urns'

// https://docs.moralis.io/docs/response-body
type MoralisWebhookBody = {
  confirmed: boolean
  logs: { address: string }[]
  nftTransfers: {
    from: string
    to: string
    tokenId: string
    contract: string
    tokenName: string
    tokenContractType: string
    transactionHash: string
  }[]
}

const MoralisHandler = async (request: Request) => {
  const providedSignature = request.headers.get('x-signature')
  if (!providedSignature) throw new Error('moralis: no signature provided')

  const bodyText = await request.text()
  const generatedSignature = web3.utils.sha3(bodyText + APIKEY_MORALIS)
  if (generatedSignature !== providedSignature)
    throw new Error('moralis: Invalid Signature')

  const body: MoralisWebhookBody = JSON.parse(bodyText)
  console.log({ body })
  if (!body.confirmed) {
    console.log('moralis: skipping unconfirmed tx')
    return new Response(null, { status: 206 })
  }

  // batch the changes to address worker
  const setTokensBody = body.nftTransfers.map((nft) => {
    const addressUrn = AddressURNSpace.fromAddress(nft.to)
    return {
      tokenId: nft.tokenId,
      contract: nft.contract,
      addressUrn: `${addressUrn}+?type=ethereum`,
    }
  })
  BLOCKCHAIN_ACTIVITY.send({
    method: 'kb_setToken',
    setTokensBody,
  })

  const setTokenMetaBody = body.nftTransfers.flatMap((nft) => nft.tokenId)
  BLOCKCHAIN_ACTIVITY.send({ method: 'kb_setTokenMeta', setTokenMetaBody })

  const setContractMetaBody = body.nftTransfers.flatMap((nft) => nft.contract)
  BLOCKCHAIN_ACTIVITY.send({
    method: 'kb_setContractMeta',
    setContractMetaBody,
  })

  return new Response(null, { status: 201 })
}

export default MoralisHandler
