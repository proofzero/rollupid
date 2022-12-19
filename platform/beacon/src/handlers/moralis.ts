import web3 from 'web3'

// https://docs.moralis.io/docs/response-body
type MoralisWebhookBody = {
  confirmed: boolean
  logs: { address: string }[]
  nftTransfer: {
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
  return new Response(null, { status: 201 })
}

export default MoralisHandler
