import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'
import { AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'

import { GrantType, ResponseType } from '@kubelt/platform.access/src/types'

import { authenticator } from '~/auth.server'
import { getAddressClient, getAccessClient } from '~/platform.server'
import { createUserSession } from '~/session.server'
import { keccak256 } from '@ethersproject/keccak256'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const authRes = (await authenticator.authenticate(
    MicrosoftStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes
  if (profile.provider !== OAuthAddressType.Microsoft)
    throw new Error('Unsupported provider returned in Microsoft callback.')

  const idref = IDRefURNSpace(OAuthAddressType.Microsoft).urn(profile.id)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const address = (AddressURNSpace.urn(hash) +
    `?+node_type=${NodeType.OAuth}&addr_type=${OAuthAddressType.Microsoft}`) as AddressURN
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()
  const existingOAuthData = await addressClient.getOAuthData.query()
  if (
    !existingOAuthData ||
    !existingOAuthData.profile ||
    existingOAuthData?.profile?.provider !== OAuthAddressType.Microsoft
  ) {
    //If we don't already have a microsoft oauth data set, we cache
    //the image and set the OAuth data set for the address
    const imageUrl = await cacheImageFromMSGraph(
      profile._json.picture,
      authRes.accessToken
    )
    profile._json.threeidImageUrl = imageUrl

    await addressClient.setOAuthData.mutate(authRes)
  }

  return authenticateAddress(address, account)
}

const cacheImageFromMSGraph = async (
  image_retrieval_url: string,
  access_token: string
): Promise<string> => {
  const msGraphRequest = fetch(image_retrieval_url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    method: 'get',
  })
  const msGraphRes = await msGraphRequest

  if (!msGraphRes.ok) {
    if (msGraphRes.status === 404) {
      //Valid error
      console.error('No image found in MSGraph for logged-in user.')
      return ''
    } else {
      console.error(
        'Error retrieving the image through MS Graph',
        msGraphRes.statusText
      )
      throw new Error('Error retrieving the image through MS Graph')
    }
  }

  const blob = await msGraphRes.blob()
  const reqFormData = new FormData()
  reqFormData.append('imageBlob', blob)

  const imagesRes = await Images.fetch('http://localhost/uploadImageBlob', {
    body: reqFormData,
    method: 'post',
  })
  if (!imagesRes) throw new Error('Could not store MSGraph avatar.')
  const imageResJson = await imagesRes.json<{ imageUrl: string }>()
  return imageResJson.imageUrl
}
