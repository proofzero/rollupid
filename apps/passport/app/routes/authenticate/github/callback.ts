import type { LoaderArgs, LoaderFunction } from '@remix-run/cloudflare'

import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNSpace } from '@kubelt/urns/address'

import { authenticator } from '~/auth.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { getAddressClient } from '~/platform.server'
import { keccak256 } from '@ethersproject/keccak256'
import { GitHubStrategy, GitHubStrategyDefaultName } from 'remix-auth-github'
import { NodeType, OAuthAddressType } from '@kubelt/types/address'
import { OAuthData } from '@kubelt/platform.address/src/types'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  console.log({ url: request.url, searchParams })
  const rollupEncoding = searchParams.get('rollup')

  //http://localhost:9696/authenticate/github/callback?rollup=eyJjbGllbnRJZCI6IjYyZmU4OTIyMzNkODZhMTUyMDZhYzk5ZjQxZjg3MWViIiwicmVkaXJlY3RVcmkiOiJodHRwczovL2dvb2dsZS5jb20iLCJzY29wZSI6bnVsbCwic3RhdGUiOiJmb29iYXIifQ==&code=cd758208d618861ef103&state=d7bd2bc4-79ee-4393-8ec7-3ff1a691654b
  if (!rollupEncoding) throw new Error('Missing rollup encoding.')

  const decoded = decodeURIComponent(rollupEncoding)
  console.log({ decoded })
  const appData = JSON.parse(decodeURIComponent(rollupEncoding))

  console.log({ appData })
  authenticator.use(
    new GitHubStrategy(
      {
        clientID: INTERNAL_GITHUB_OAUTH_CLIENT_ID,
        clientSecret: SECRET_GITHUB_OAUTH_CLIENT_SECRET,
        callbackURL: INTERNAL_GITHUB_OAUTH_CALLBACK_URL,
        allowSignup: false,
        scope: [],
      },
      async ({ ...args }) => {
        //Return all fields
        return { ...args }
      }
    )
  )

  const authRes = (await authenticator.authenticate(
    GitHubStrategyDefaultName,
    request
  )) as OAuthData

  const { profile } = authRes

  if (profile.provider !== OAuthAddressType.GitHub)
    throw new Error('Unsupported provider returned in Github callback.')

  if (!profile._json?.login) throw new Error('Could not get Github login info.')

  const address = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(OAuthAddressType.GitHub, profile.id),
    { node_type: NodeType.OAuth, addr_type: OAuthAddressType.GitHub },
    { alias: profile._json.login, hidden: 'true' }
  )
  const addressClient = getAddressClient(address)
  const account = await addressClient.resolveAccount.query()

  await addressClient.setOAuthData.mutate(authRes)

  return authenticateAddress(address, account, appData)
}
