import { json } from '@remix-run/cloudflare'
import { gatewayFromIpfs } from '~/helpers/gateway-from-ipfs'
import { getGalaxyClient } from '~/helpers/clients'
import { ActionFunction } from 'react-router-dom'

export const action: ActionFunction = async ({ request }) => {
  const { owner, pageKeys } = (await request.json()) as {
    owner: string
    pageKeys: any | undefined
  }

  if (!owner) {
    throw new Error('Owner required')
  }
  const galaxyClient = await getGalaxyClient()
  // const { nftsForAddress: res } = await galaxyClient.getNftsForAddress({
  //   owner,
  // })
  const { contractsForAddress: resColl } =
    await galaxyClient.getNftsPerCollection({
      owner,
      excludeFilters: ['SPAM'],
    })
  // const ownedNfts = res?.ownedNfts.map((nft) => {
  //   const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
  //   let error = false
  //   if (nft.error) {
  //     error = true
  //   }
  //   return {
  //     url: gatewayFromIpfs(media?.raw),
  //     thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
  //     error: error,
  //     title: nft.title,
  //     collectionTitle: nft.contractMetadata?.name,
  //     properties: nft.metadata?.properties,
  //     details: [
  //       {
  //         name: 'NFT Contract',
  //         value: nft.contract?.address,
  //       },
  //       { name: 'NFT Standard', value: nft.contractMetadata?.tokenType },
  //     ],
  //   }
  // })

  const ownedNfts = resColl?.contracts.map((contract) => {
    const nft: any = contract?.ownedNfts ? contract.ownedNfts[0] : {}
    const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
    let error = false
    if (nft.error) {
      error = true
    }
    return {
      url: gatewayFromIpfs(media?.raw ?? undefined),
      thumbnailUrl: gatewayFromIpfs(
        media?.thumbnail ?? media?.raw ?? undefined
      ),
      error: error,
      title: nft.title,
      collectionTitle: nft.contractMetadata?.name,
      properties: nft.metadata?.properties,
      details: [
        {
          name: 'NFT Contract',
          value: nft.contract?.address,
        },
        { name: 'NFT Standard', value: nft.contractMetadata?.tokenType },
      ],
    }
  })

  const filteredNfts =
    ownedNfts?.filter((n) => !n.error && n.thumbnailUrl) || []

  return json({
    ownedNfts: filteredNfts,
    pageKeys: res?.pageKeys,
  })
}
