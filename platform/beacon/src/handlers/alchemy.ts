import * as crypto from 'crypto'

const isValidSignatureForStringBody = (
  body: string, // must be raw string body, not json transformed version of the body
  signature: string, // your "x-alchemy-signature" from header
  signingKey: string // for specific webhook
): boolean => {
  const hmac = crypto.createHmac('sha256', signingKey) // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, 'utf8') // Update the token hash with the request body using utf8
  const digest = hmac.digest('hex')
  return signature === digest
}

const AlchemyHandler = async (request: Request) => {
  const body = await request.text()
  const signature = request.headers.get('x-alchemy-signature')
  if (!signature) {
    throw new Error('No signature found')
  }
  if (!isValidSignatureForStringBody(body, signature, 'key')) {
  }
  const jsonBody = JSON.parse(body)

  switch (jsonBody.type) {
    case 'NFT_ACTIVIY': // https://docs.alchemy.com/reference/nft-activity-webhook
      jsonBody.event.activity.forEach((activity: any) => {
        const contractAddress = activity.contractAddress
        const from = activity.fromAddress
        const to = activity.toAddress

        // TODO: queue update for each address
      })
      break
    case 'NFT_METADATA_UPDATE':
      // TODO: in future this is where you would update a contract nodes metadata
      console.log('ignore: NFT_METADATA_UPDATE')
      break
    case 'ADDRESS_ACTIVIY':
      // TODO: in the future this is where we would track a users blockchain activity
      console.log('ignore: ADDRESS_ACTIVIY')
      break
    default:
      console.log(`Unhandled webhook type: ${jsonBody.type}`)
  }

  return null
}

export default AlchemyHandler
