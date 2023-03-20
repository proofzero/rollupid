import { Await, useLoaderData, useNavigate } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { defer, json } from '@remix-run/cloudflare'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { Suspense } from 'react'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type {
  AuthorizedAccountsOutput,
  AuthorizedUser,
} from '@proofzero/platform/starbase/src/types'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import { AccountURNSpace } from '@proofzero/urns/account'

import { noLoginsSvg } from '~/components/Applications/LoginsPanel/LoginsPanel'
import { User } from '~/components/Applications/Users/User'

import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'

// don't change this constant unless it's necessary
// this constant also affects /$clientId root route
export const PAGE_LIMIT = 10

export type UsersLoaderData = {
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

    return defer<UsersLoaderData>({ edgesResult, PROFILE_APP_URL, error: null })
  } catch (ex: any) {
    console.error(ex)
    return json<UsersLoaderData>({ error: ex })
  }
}

const Users = () => {
  const navigate = useNavigate()
  const { edgesResult, PROFILE_APP_URL } = useLoaderData()

  const loadUsersSubset = (offset: number) => {
    const query = new URLSearchParams()
    if (offset || offset === 0)
      query.set('page', (offset / PAGE_LIMIT + 1).toString())
    navigate(`?${query}`)
  }

  const Users = new Map<
    string,
    {
      imageURL?: string
      name?: string
      date?: string
    }
  >()

  return (
    <div className="w-full h-full min-h-[360px]">
      <div className="flex flex-row items-center space-x-3 pb-4">
        <Text size="2xl" weight="semibold" className="text-gray-900">
          Users
        </Text>
        <DocumentationBadge
          url={'https://docs.rollup.id/platform/console/users'}
        />
      </div>
      <Suspense
        fallback={
          <div
            className="flex bg-white justify-center items-center h-full
rounded-lg border shadow"
          >
            <Spinner />
          </div>
        }
      >
        <Await resolve={edgesResult} errorElement={<NestedErrorPage />}>
          {(edgesResult) => {
            if (!edgesResult.metadata.offset) {
              edgesResult.metadata.offset = 0
            }
            const authorizedProfiles = edgesResult
            edgesResult.accounts.forEach((account: AuthorizedUser) => {
              const decodedAccountURN = AccountURNSpace.decode(
                account.accountURN
              )

              // Keys are decoded accountURNs
              Users.set(decodedAccountURN, {
                name: account.name!,
                date: new Date(account.timestamp).toLocaleString('default', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
                imageURL: account.imageURL!,
              })
            })

            const orderOfResults = `Showing ${
              authorizedProfiles.metadata.offset + 1
            } to ${Math.min(
              authorizedProfiles.metadata.offset + PAGE_LIMIT,
              authorizedProfiles.metadata.edgesReturned
            )} of ${authorizedProfiles.metadata.edgesReturned} results`
            return (
              <>
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
                      {Array.from(Users.keys()).map((key) => (
                        <User
                          key={key}
                          imageURL={Users.get(key)?.imageURL}
                          name={Users.get(key)?.name}
                          date={Users.get(key)?.date}
                          publicProfileURL={`${PROFILE_APP_URL}/p/${key}`}
                        />
                      ))}
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
            )
          }}
        </Await>
      </Suspense>
    </div>
  )
}

export default Users
