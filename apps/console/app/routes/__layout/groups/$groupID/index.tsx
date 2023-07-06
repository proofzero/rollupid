import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { Form, useLoaderData, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../../groups'
import { useRef } from 'react'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import _ from 'lodash'
import createAccountClient from '@proofzero/platform-clients/account'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'

type InvitationModel = {
  identifier: string
  addressType: EmailAddressType | OAuthAddressType | CryptoAddressType
  invitationURL: string
}

type LoaderData = {
  groupID: string
  URN: IdentityGroupURN
  invitations: InvitationModel[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupURN = `${['urn:rollupid:identity-group', params.groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(groupURN)) {
      throw new Error('Invalid group ID')
    }

    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const invitations =
      await accountClient.getIdentityGroupMemberInvitations.query({
        identityGroupURN: groupURN,
      })

    const mappedInvitations = invitations.map((invitation) => ({
      identifier: invitation.identifier,
      addressType: invitation.addressType,
      invitationURL: '#',
    }))

    return json<LoaderData>({
      groupID: params.groupID as string,
      URN: groupURN,
      invitations: mappedInvitations,
    })
  }
)

export default () => {
  const { groups } = useOutletContext<GroupRootContextData>()
  const { URN, groupID, invitations } = useLoaderData<LoaderData>()

  const group = useRef(groups.find((group) => group.URN === URN))
  const addressTypes = useRef(() => {
    const emailTypes = Object.values(EmailAddressType)
    const oauthTypes = Object.values(OAuthAddressType)
    const cryptoTypes = Object.values(CryptoAddressType)

    return [...emailTypes, ...oauthTypes, ...cryptoTypes]
  })

  return (
    <>
      <section>Name: {group.current?.name}</section>
      <section>
        <pre>{JSON.stringify(group.current, null, 2)}</pre>
        <pre>{JSON.stringify(invitations, null, 2)}</pre>
      </section>
      <section>
        <Form method="post" action={`/groups/${groupID}/invite`}>
          <select name="addressType">
            {addressTypes.current().map((addressType) => (
              <option key={addressType} value={addressType}>
                {_.upperFirst(addressType)}
              </option>
            ))}
          </select>

          <input type="text" name="identifier" />

          <button type="submit">Invite</button>
        </Form>
      </section>
    </>
  )
}
