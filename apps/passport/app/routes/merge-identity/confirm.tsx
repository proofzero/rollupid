import { useContext, useEffect } from 'react'
import { type LoaderFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData, Form } from '@remix-run/react'

import { ImArrowDown } from 'react-icons/im'

import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import dangerVector from '~/assets/warning.svg'

import { getCoreClient } from '~/platform.server'

import {
  getIdentityMergeState,
  getValidatedSessionContext,
} from '~/session.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const mergeIdentityState = await getIdentityMergeState(request, context.env)
    if (!mergeIdentityState)
      throw new BadRequestError({
        message: 'missing merge identity state',
      })

    const { source, target } = mergeIdentityState

    const { jwt, identityURN } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    if (identityURN !== target)
      throw new BadRequestError({
        message: 'invalid merge identity state',
      })

    const coreClient = getCoreClient({
      context,
      jwt,
    })

    const preview = await coreClient.identity.mergePreview.query({
      source,
      target,
    })

    return {
      source: preview.source,
      target: preview.target,
    }
  }
)

type LoaderData = {
  source: UserProps
  target: UserProps
}

export default function Confirm() {
  const { dark } = useContext(ThemeContext)
  const { source, target } = useLoaderData<LoaderData>()
  const fetcher = useFetcher<{ error?: { message: string } }>()

  useEffect(() => {
    if (fetcher.state !== 'idle') return
    if (fetcher.type !== 'done') return
    if (!fetcher.data) return
    if (!fetcher.data.error) return
    toast(ToastType.Error, fetcher.data.error, { duration: 2000 })
  }, [fetcher])

  return (
    <>
      <div className={`${dark ? 'dark' : ''}`}>
        <div className="flex flex-row h-[100dvh] justify-center items-center bg-[#F9FAFB] dark:bg-gray-900">
          <div
            className="basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 dark:bg-[#1F2937] overflow-hidden"
            style={{
              backgroundImage: `url(${sideGraphics})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="basis-full lg:basis-3/5">
            <div className="flex flex-col w-[402px] min-h-fit m-auto p-6 space-y-8 box-border bg-white dark:bg-[#1F2937] border rounded-lg  border-[#D1D5DB] dark:border-gray-600">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-y-4">
                  <img
                    src={dangerVector}
                    className="inline-block w-[48px] h-[48px] mr-4"
                    alt="danger"
                  />
                </div>
                <div className="flex flex-col justify-content space-y-2">
                  <Text
                    size="xl"
                    weight="semibold"
                    className="leading-8 text-center text-[#2D333A] dark:text-white"
                  >
                    Confirm Identity Merge
                  </Text>
                  <Text
                    type="span"
                    className="leading-6 text-center text-orange-600"
                  >
                    This action permanently transfers <br />
                    <Text type="span" weight="semibold">
                      all accounts
                    </Text>{' '}
                    from one identity to other.
                  </Text>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <User
                    avatar={source.avatar}
                    displayName={source.displayName}
                    primaryAccountAlias={source.primaryAccountAlias}
                    accounts={source.accounts}
                    applications={source.applications}
                  />
                  <ImArrowDown color="#D1D5DB" size={32} />
                  <User
                    avatar={target.avatar}
                    displayName={target.displayName}
                    primaryAccountAlias={target.primaryAccountAlias}
                    accounts={target.accounts}
                    applications={target.applications}
                  />
                </div>
                <div className="flex justify-between">
                  <Form method="get" action="/merge-identity/cancel">
                    <Button
                      type="submit"
                      btnType="secondary-alt"
                      className="w-40"
                    >
                      Cancel
                    </Button>
                  </Form>
                  <fetcher.Form method="post" action="/merge-identity/merge">
                    <Button
                      type="submit"
                      btnType="primary-alt"
                      className="w-40"
                    >
                      Confirm Merge
                    </Button>
                  </fetcher.Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type UserProps = {
  avatar: string
  displayName: string
  primaryAccountAlias: string
  accounts: number
  applications: number
}

const User = ({
  avatar,
  displayName,
  primaryAccountAlias,
  accounts,
  applications,
}: UserProps) => {
  return (
    <div className="w-[350px] border rounded-md border-gray-200 dark:border-gray-600">
      <div className="min-w-full">
        <div className="flex p-2 space-x-2 border-b border-gray-200 dark:border-gray-600">
          <img
            src={avatar}
            alt="avatar"
            className="w-[40px] h-[40px] rounded-full"
          />
          <div>
            <Text
              size="sm"
              weight="semibold"
              className="leading-5 text-gray-600 dark:text-white"
            >
              {displayName}
            </Text>
            <Text
              size="sm"
              weight="normal"
              className="leading-5 text-gray-400 dark:text-[#6B7280]"
            >
              {primaryAccountAlias}
            </Text>
          </div>
        </div>
        <div>
          <div className="p-2 space-y-2 leading-5 text-gray-500 dark:text-[#6B7280]">
            <div>
              <Text type="span" size="sm" weight="semibold">
                Accounts:{' '}
                <Text type="span" size="sm" weight="normal">
                  {accounts}
                </Text>
              </Text>
            </div>
            <div>
              <Text type="span" size="sm" weight="semibold">
                Applications:{' '}
                <Text type="span" size="sm" weight="normal">
                  {applications}
                </Text>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
