import type { LoaderFunction } from '@remix-run/cloudflare'

import { BadRequestError } from '@proofzero/errors'
import { JsonError } from '@proofzero/utils/errors'
import { AddressURNSpace } from '@proofzero/urns/address'

import { getAddressClient } from '~/platform.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  if (!params['address']) {
    throw JsonError(new BadRequestError({ message: 'address is missing' }))
  }

  const addressUrn = AddressURNSpace.urn(params['address'])

  const addressClient = getAddressClient(
    addressUrn,
    context.env,
    context.traceSpan
  )

  const data = atob(await addressClient.getAddressAvatar.query())
  const buffer = new ArrayBuffer(data.length)
  const bufferView = new Uint8Array(buffer)
  for (var i = 0; i < data.length; i++) {
    bufferView[i] = data.charCodeAt(i)
  }

  return new Response(buffer, {
    headers: {
      'cache-control': `max-age=${5 * 60}`,
    },
  })
}
