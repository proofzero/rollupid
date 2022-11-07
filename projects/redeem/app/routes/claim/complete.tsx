import { useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/cloudflare'

import Confetti from 'react-confetti'
import { useWindowWidth, useWindowHeight } from '@react-hook/window-size'

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

import { getCachedVoucher } from '~/helpers/voucher'

// @ts-ignore
export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const address = url.searchParams.get('address')

  if (!address) {
    throw json('No address provided', { status: 400 })
  }

  //@ts-ignore
  const proof = await PROOFS.get(address, { type: 'json' })
  if (!proof) {
    return redirect(`/claim/proof?address=${address}`)
  }

  const voucher = await getCachedVoucher(address)
  if (!voucher) {
    redirect('https://3id.kubelt.com/account')
  }
  return json({
    voucher,
  })
}

export default function Success() {
  const { voucher } = useLoaderData()

  return (
    <>
      <div className="mx-auto justify-center items-center text-center">
        <div>
          <Text
            className="text-center"
            size={TextSize.XL3}
            weight={TextWeight.SemiBold600}
          >
            Proof Complete! 🥳
          </Text>
        </div>
        <div>
          <Text
            className="mt-4 mb-8"
            size={TextSize.XL}
            weight={TextWeight.Regular400}
          >
            You can now login to the 3ID application
          </Text>
        </div>
        <div
          className="w-24 h-24 w-full block m-auto mb-12"
          style={{
            clipPath:
              'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
            boxShadow: 'inset 0px 10px 100px 10px white',
            transform: 'scale(1.2)',
          }}
        >
          <img src={voucher?.metadata.image} className="w-24 h-24" />
        </div>
        <a
          className="py-4 px-6 rounded w-full text-white font-bold"
          style={{
            backgroundColor: '#1F2937',
          }}
          href={'https://3id.kubelt.com/'}
        >
          Login to 3ID
        </a>
      </div>
      <Confetti width={useWindowWidth()} height={useWindowHeight()} />
    </>
  )
}
