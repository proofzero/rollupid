import { LoaderFunction, json } from '@remix-run/cloudflare'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { AlchemyClient } from '~/utils/alchemy.server'

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url)

  // @ts-ignore
  if(!ALCHEMY_NFT_API_URL) {
    throw new Error("Make sure 'ALCHEMY_NFT_API_URL' env variable is set.")
  }
  
  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    throw new Error('Owner required')
  }

  const pageKey = srcUrl.searchParams.get('pageKey')
  
  const alchemy = new AlchemyClient()
  const res = await alchemy.getNFTsForOwner(owner, {pageKey})
  const ownedNfts = res.ownedNfts.map(
    (nft) => {
      let properties: {
        name: string
        value: any
        display: string
      }[] = []

      // TODO: @Cosmin this field is not in the alchemy schema. Does why check?
      if (nft.metadata.properties) {
        const validProps = Object.keys(nft.metadata.properties)
          .filter((k) => typeof nft.metadata.properties[k] !== 'object')
          .map((k) => ({
            name: k,
            value: nft.metadata.properties[k],
            display: typeof nft.metadata.properties[k],
          }))

        properties = properties.concat(validProps)
      }

      // TODO: @Cosmin why no just use nft.metadata.attributes?
      if (nft.metadata.attributes?.length) {
        const mappedAttributes = nft.metadata.attributes.map((a) => ({
          name: a.trait_type,
          value: a.value,
          display: a.display_type, // TODO: @Cosmin this field is not in the alchemy schema. 
        }))

        properties = properties.concat(mappedAttributes)
      }

      return {
        url: nft.media.raw, // TODO: @Cosmin why is this an array?
        title: nft.title,
        collectionTitle: nft.contractMetadata?.name,
        properties,
      }
    }
  )

  return json({res: ownedNfts})
}
