import { json } from 'stream/consumers'
import { AlchemyClient } from '~/utils/alchemy.server'

type FetchVoucherParams = {
  address: string
}

export const fetchVoucher = async ({ address }: FetchVoucherParams) => {
  // @ts-ignore
  const nftarUrl = NFTAR_URL
  // @ts-ignore
  const nftarToken = NFTAR_AUTHORIZATION
  // @ts-ignore
  const contractAddress = MINTPFP_CONTRACT_ADDRESS as string
  // @ts-ignore
  const chainId = NFTAR_CHAIN_ID

  // check if the user has already minted
  const alchemy = new AlchemyClient()
  const nfts = await alchemy.getNFTsForOwner(address, contractAddress)

  if (nfts.ownedNfts.length > 0) {
    console.log('owner already has a pfp', nfts.ownedNfts[0])
    const voucher = {
      chainId,
      contractAddress,
      minted: true,
      metadata: nfts.ownedNfts[0].metadata,
    }
    await putCachedVoucher(address, voucher)
    return json({ contractAddress, voucher })
  }

  const nftarFetch = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${nftarToken}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: 'ethereum',
          chainId,
        },
      },
    }),
  }

  const response = await fetch(`${nftarUrl}`, nftarFetch)

  const jsonRes = await response.json()

  if (jsonRes.error) {
    throw new Error(jsonRes.error.data.message)
  }

  let res = {
    ...jsonRes.result,
    contractAddress,
  }

  res.metadata.cover = jsonRes.result.metadata.cover
  res.metadata.image = jsonRes.result.metadata.image

  fetch(res.metadata.image)
  fetch(res.metadata.cover)

  return res
}

export const getCachedVoucher = async (address: string) => {
  // @ts-ignore
  return VOUCHER_CACHE.get(address, { type: 'json' })
}

export const putCachedVoucher = async (address: string, voucher: any) => {
  // @ts-ignore
  let cachedVoucher = await VOUCHER_CACHE.get(address, { type: 'json' })
  if (!cachedVoucher) {
    cachedVoucher = {
      // @ts-ignore
      chainId: NFTAR_CHAIN_ID,
      // @ts-ignore
      contractAddress: MINTPFP_CONTRACT_ADDRESS,
      minted: false,
    }
  }

  const updatedVoucher = {
    ...cachedVoucher,
    ...voucher,
  }

  // @ts-ignore
  await VOUCHER_CACHE.put(address, JSON.stringify(updatedVoucher))

  return updatedVoucher
}
