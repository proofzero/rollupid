import { redirect } from '@remix-run/cloudflare'

import { Outlet, useLoaderData } from '@remix-run/react'

import styles from '~/styles/auth.css'
import logo from '~/assets/three-id-logo.svg'

import { getUserSession, requireJWT } from '~/utils/session.server'

import {
  configureChains,
  createClient,
  defaultChains,
  WagmiConfig,
} from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import validateProof from '~/helpers/validate-proof'

import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

// @ts-ignore
export const loader = async ({ request }) => {
  await requireJWT(request)

  const address = (await getUserSession(request)).get('address')
  if (!(await validateProof(address))) {
    return redirect(`/auth/gate/${address}`)
  }

  if (!request.url.includes('name') && !request.url.includes('mint')) {
    return redirect(`/onboard/name`)
  }

  return {
    // @ts-ignore
    ALCHEMY_PUBLIC_API_KEY: ALCHEMY_PUBLIC_API_KEY,
  }
}

const Onboard = () => {
  const ld = useLoaderData()

  const { chains, provider } = configureChains(
    defaultChains,
    [
      publicProvider(),
      alchemyProvider({
        // @ts-ignore
        apiKey: ld.ALCHEMY_PUBLIC_API_KEY,
      }),
    ],
    {
      targetQuorum: 1,
      pollingInterval: 5_000,
    }
  )

  const client = createClient({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
    ],
    provider,
  })

  return (
    <>
      <div className="grid grid-row-3 gap-4">
        <nav className="col-span-3">
          <img src={logo} alt="threeid" />
        </nav>
      </div>

      <div className="max-w-4xl mx-auto mt-2 lg:mt-28 p-4">
        <div className="flex flex-col p-6 lg:bg-white lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-md min-h-[580px] space-y-4">
          <WagmiConfig client={client}>
            <Outlet />
          </WagmiConfig>
        </div>
      </div>
    </>
  )
}

export default Onboard
