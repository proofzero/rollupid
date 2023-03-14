import { useLoaderData, useNavigate } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { defer, json } from '@remix-run/cloudflare'
import { useTransition } from '@remix-run/react'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { useState, useEffect } from 'react'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { AuthorizedAccountsOutput } from '@kubelt/platform/starbase/src/types'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'
import type { AuthorizedProfile, edgesMetadata } from '~/types'

import { AccountURNSpace } from '@kubelt/urns/account'

import missingImage from '~/images/missing-img.svg'
import { noLoginsSvg } from '~/components/Applications/LoginsPanel/LoginsPanel'

import { HiOutlineExternalLink } from 'react-icons/hi'

import { NestedErrorPage } from '@kubelt/design-system/src/pages/nested-error/NestedErrorPage'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import { Button, Text } from '@kubelt/design-system'

// don't change this constant unless it's necessary
// this constant also affects /$clientId root route
export const PAGE_LIMIT = 10

type LoaderData = {
  edgesResult?: Promise<AuthorizedAccountsOutput>
  PROFILE_APP_URL?: string
  error: any
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const jwt = await requireJWT(request)
  const srcUrl = new URL(request.url)

  try {
    const client = params.clientId
    const page = srcUrl.searchParams.get('page')

    // because offset is shown as an integer page number I convert it here
    // to the actual offset for the database. (page starts with 1, not 0)
    const offset = page ? (parseInt(page) - 1) * PAGE_LIMIT : 0

    if (!client) {
      throw new Error('clientId is required')
    }

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const edgesResult = starbaseClient.getAuthorizedAccounts.query({
      client,
      opt: {
        offset,
        limit: PAGE_LIMIT,
      },
    })

    return defer<LoaderData>({ edgesResult, PROFILE_APP_URL, error: null })
  } catch (ex: any) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}

const Users = () => {
  const navigate = useNavigate()
  const transition = useTransition()
  const { edgesResult, PROFILE_APP_URL, error } = useLoaderData()
  const [authorizedProfiles, setAuthorizedProfiles] = useState({
    accounts: [] as AuthorizedProfile[],
    metadata: {
      offset: 0,
      limit: PAGE_LIMIT,
      edgesReturned: 0,
    } as edgesMetadata,
  })

  const loadUsersSubset = (offset: number) => {
    const query = new URLSearchParams()
    if (offset || offset === 0)
      query.set('page', (offset / PAGE_LIMIT + 1).toString())
    navigate(`?${query}`)
  }

  useEffect(() => {
    ;(async () => {
      if (edgesResult) {
        const awaitedEdgesResult = await edgesResult
        if (!awaitedEdgesResult.metadata.offset) {
          awaitedEdgesResult.metadata.offset = 0
        }

        setAuthorizedProfiles(awaitedEdgesResult)
      }
    })()
  }, [edgesResult])

  const Users = new Map<
    string,
    {
      imageURL?: string
      name?: string
      date?: string
    }
  >()

  authorizedProfiles.accounts.forEach((authProfile) => {
    const decodedAccountURN = AccountURNSpace.decode(authProfile.accountURN)

    // Keys are decoded accountURNs
    Users.set(decodedAccountURN, {
      name: authProfile.name!,
      date: new Date(authProfile.timestamp).toLocaleString('default', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      imageURL: authProfile.imageURL!,
    })
  })

  const orderOfResults = `Showing ${
    authorizedProfiles.metadata.offset + 1
  } to ${Math.min(
    authorizedProfiles.metadata.offset + PAGE_LIMIT,
    authorizedProfiles.metadata.edgesReturned
  )} of ${authorizedProfiles.metadata.edgesReturned} results`

  return (
    <div className="w-full h-full min-h-[360px]">
      {error ? (
        <NestedErrorPage />
      ) : (
        <>
          <Text size="2xl" weight="semibold" className="text-gray-900 pb-4">
            Users
          </Text>
          {!Users.size ? (
            <div
              className="flex flex-col bg-white
        shadow rounded-lg border justify-center items-center min-h-[360px] h-full"
            >
              {noLoginsSvg}

              <Text weight="medium" className="text-gray-500 mt-9 mt-2">
                No one signed up to your app yet.
              </Text>
              <Text weight="medium" className="text-gray-500">
                <a className="text-indigo-500" href="/">
                  Go to Docs
                </a>{' '}
                and try the signup flow.
              </Text>
            </div>
          ) : (
            <div className="border flex-1 flex flex-col rounded-lg">
              <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-lg">
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1 break-all"
                >
                  USER ID
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1 px-2 break-all"
                >
                  FIRST AUTHORIZATION
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1 break-all text-right"
                >
                  PROFILE
                </Text>
              </div>

              <div
                className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg"
              >
                {transition.state === 'loading' ? (
                  <div
                    className="flex bg-white justify-center items-center h-full
            rounded-lg border shadow"
                  >
                    <Spinner />
                  </div>
                ) : (
                  Array.from(Users.keys()).map((key, i) => (
                    <article
                      key={i}
                      className="flex items-center py-5 px-8 border-t"
                    >
                      <div
                        className="flex-1 flex flex-col 
                  items-start 
                  md:flex-row md:items-center
                  text-ellipsis md:space-x-4"
                      >
                        <img
                          src={Users.get(key)?.imageURL || missingImage}
                          alt="account pfp"
                          className="max-h-[24px] max-w-[24px] rounded-full"
                        />
                        <Text
                          size="sm"
                          weight="medium"
                          className="text-gray-500 flex-1"
                        >
                          {Users.get(key)?.name}
                        </Text>
                      </div>

                      <Text
                        size="sm"
                        weight="medium"
                        className="text-ellipsis text-gray-500
                   flex-1 px-2"
                      >
                        {Users.get(key)?.date}
                      </Text>
                      <a
                        className="flex-1 flex justify-end"
                        href={`${PROFILE_APP_URL}/p/${key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          btnType="secondary-alt"
                          className="right-0 flex md:flex-row flex-col max-w-max 
                  text-xs leading-4 items-center md:space-x-2"
                        >
                          <HiOutlineExternalLink size={22} />
                          Public Profile
                        </Button>
                      </a>
                    </article>
                  ))
                )}
                <div className="flex items-center py-4 px-8 border-t justify-between">
                  <Text className="text-gray-700">{orderOfResults}</Text>
                  <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row ml-2">
                    <Button
                      type="button"
                      disabled={authorizedProfiles.metadata.offset === 0}
                      btnSize="l"
                      btnType="secondary-alt"
                      onClick={() => {
                        loadUsersSubset(
                          authorizedProfiles.metadata.offset - PAGE_LIMIT
                        )
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      disabled={
                        authorizedProfiles.metadata.offset + PAGE_LIMIT >=
                        authorizedProfiles.metadata.edgesReturned
                      }
                      btnSize="l"
                      btnType="secondary-alt"
                      onClick={() => {
                        loadUsersSubset(
                          authorizedProfiles.metadata.offset + PAGE_LIMIT
                        )
                      }}
                      className="sm:ml-4"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Users
