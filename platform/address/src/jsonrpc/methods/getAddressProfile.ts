import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import { EthereumAddressDescription } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const nodeClient = context.get('node_client')
  const profile = await nodeClient.getProfile()
  if (profile) {
    return openrpc.response(request, profile)
  }

  const address = await nodeClient.getAddress()
  const type = await nodeClient.getType()

  const ensRes = await fetch(`${context.get('ENS_RESOLVER_URL')}/${address}`)
  const { avatar, displayName }: EthereumAddressDescription =
    await ensRes.json()

  const newProfile = {
    cover: '',
    displayName: displayName || address,
    pfp: {
      image: avatar || '',
      isToken: !!avatar,
    },
  }

  try {
    const chainType = type === 'eth' ? 'ethereum' : type
    const voucher = await getNftarVoucher(address, chainType, context)
    if (!voucher) {
      return openrpc.error(request, {
        code: -32500,
        message: 'Unable to get voucher from Nftar',
      })
    }
    const pfp = gatewayFromIpfs(voucher.metadata.image)
    const cover = gatewayFromIpfs(voucher.metadata.cover)

    newProfile.pfp.image ||= pfp
    newProfile.cover = cover

    await nodeClient.setPfpVoucher({ voucher })
    await nodeClient.setProfile({ profile: newProfile })

    return openrpc.response(request, newProfile)
  } catch (error) {
    return openrpc.error(request, {
      code: -32500,
      message: (error as Error).message,
    })
  }
}

type NftarError = {
  data: {
    message: string
  }
}

type NftarVoucher = {
  metadata: {
    cover: string
    image: string
  }
}

type NftarResponse = {
  error?: NftarError
  result?: NftarVoucher
}

const getNftarVoucher = async (
  address: string,
  type: string,
  context: RpcContext
): Promise<NftarVoucher | undefined> => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${context.get('TOKEN_NFTAR')}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: type,
          chainId: context.get('NFTAR_CHAIN_ID'),
        },
      },
    }),
  }
  const response = await fetch(`${context.get('NFTAR_URL')}`, request)
  const responseBody: NftarResponse = await response.json()

  if ('error' in responseBody) {
    throw new Error(JSON.stringify(responseBody.error))
  } else if ('result' in responseBody) {
    return responseBody.result
  }
}

const gatewayFromIpfs = (ipfsUrl: string): string => {
  const regex =
    /ipfs:\/\/(?<prefix>ipfs\/)?(?<cid>[a-zA-Z0-9]+)(?<path>(?:\/[\w.-]+)+)?/
  const match = ipfsUrl?.match(regex)

  if (!ipfsUrl || !match) return ipfsUrl

  const prefix = match[1]
  const cid = match[2]
  const path = match[3]

  const url = `https://nftstorage.link/${prefix ? `${prefix}` : 'ipfs/'}${cid}${
    path ? `${path}` : ''
  }`

  fetch(url) // prime the gateway
  return url
}
