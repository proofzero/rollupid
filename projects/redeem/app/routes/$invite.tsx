import { useEffect } from 'react'
import { useNavigate } from '@remix-run/react'

import { json } from '@remix-run/cloudflare'

import { useLoaderData } from '@remix-run/react'

import IndexLayout from '~/routes/index'

//@ts-ignore
export const loader = async ({ params }) => {
  const invite = params.invite
  // @ts-ignore
  const inviteRec = await THREEID_INVITE_CODES.get(invite)
  console.log("invite found for:", inviteRec && invite)
  return json({ inviteCode: inviteRec && invite }) // if invite is found, return invite else return false
}

export default function Index() {
  const data = useLoaderData()

  return <IndexLayout inviteCode={data.inviteCode} />
}
