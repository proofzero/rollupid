import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { requireJWT } from '~/utilities/session.server'
import { GroupModel, GroupRootContextData } from '../groups'
import { useEffect, useMemo } from 'react'

export type InvitationModel = {
  identifier: string
  accountType: EmailAccountType | OAuthAccountType | CryptoAccountType
  invitationURL: string
}

type LoaderData = {
  groupID: string
  groupURN: IdentityGroupURN
  invitations: InvitationModel[]
}

export type GroupDetailsContextData = LoaderData &
  GroupRootContextData & {
    group: GroupModel
  }

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupURN = IdentityGroupURNSpace.urn(
      params.groupID as string
    ) as IdentityGroupURN

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const invitations =
      await coreClient.identity.getIdentityGroupMemberInvitations.query({
        identityGroupURN: groupURN,
      })

    const mappedInvitations = invitations.map((invitation) => ({
      identifier: invitation.identifier,
      accountType: invitation.accountType,
      invitationURL: [
        context.env.PASSPORT_URL,
        'groups',
        'enroll',
        params.groupID,
        invitation.invitationCode,
      ].join('/'),
    }))

    return json<LoaderData>({
      groupID: params.groupID as string,
      groupURN: groupURN,
      invitations: mappedInvitations,
    })
  }
)

export default () => {
  const ctx = useOutletContext<GroupRootContextData>()
  const { groups, paymentFailedIdentityGroups } = ctx

  const { groupURN, groupID, invitations } = useLoaderData<LoaderData>()

  const group = useMemo(
    () => groups.find((group) => group.URN === groupURN) ?? null,
    [groups]
  )

  const navigate = useNavigate()

  useEffect(() => {
    // Initial state is undefined
    // Our not found state is null

    // Because we load data client side
    // We want to redirect if group
    // is not found
    if (group === null) {
      navigate('/groups')
    }
  }, [group])

  return (
    <Outlet
      context={{
        ...ctx,
        group,
        groupID,
        groupURN,
        invitations,
        paymentFailedIdentityGroups,
      }}
    />
  )
}
