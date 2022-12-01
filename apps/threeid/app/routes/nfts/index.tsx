import { LoaderFunction, json } from '@remix-run/cloudflare'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/galaxyClient'

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url)

  const owner = srcUrl.searchParams.get('owner')
  if (!owner) {
    throw new Error('Owner required')
  }

  const pageKey = srcUrl.searchParams.get('pageKey')

  const galaxyClient = await getGalaxyClient()
  const { nftsForAddress: res } = await galaxyClient.getNftsForAddress({
    owner,
    pageKey,
  })
  const ownedNfts = res.ownedNfts.map((nft) => {
    let properties: {
      name: string
      value: any
      display: string
    }[] = []

    // TODO: is this here b/c pfp does not conform to standard?
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

    if (nft.metadata.attributes?.length) {
      const mappedAttributes = nft.metadata.attributes.map((a) => ({
        name: a.trait_type,
        value: a.value,
        display: a.display_type || 'string', // TODO: @Cosmin this field is not in the alchemy schema. Is it needed at all?
      }))

      properties = properties.concat(mappedAttributes)
    }

    const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
    let error = false
    if (nft.error) {
      error = true
    }
    return {
      url: gatewayFromIpfs(media?.raw),
      thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
      error: error,
      title: nft.title,
      collectionTitle: nft.contractMetadata?.name,
      properties,
    }
  })

  const filteredNfts = ownedNfts.filter((n) => !n.error && n.thumbnailUrl)

  return json({
    ownedNfts: filteredNfts,
    pageKey: res.pageKey,
  })
}
