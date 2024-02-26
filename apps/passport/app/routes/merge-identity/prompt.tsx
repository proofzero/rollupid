import { useContext, useState } from 'react'
import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, Form } from '@remix-run/react'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'

import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { AccountURNSpace } from '@proofzero/urns/account'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import dangerVector from '~/assets/warning.svg'

import { getIdentityMergeState } from '~/session.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const mergeIdentityState = await getIdentityMergeState(request, context.env)
    if (!mergeIdentityState)
      throw new BadRequestError({
        message: 'missing merge identity state',
      })

    const { account } = mergeIdentityState
    const alias = AccountURNSpace.componentizedParse(account).qcomponent?.alias
    return { alias }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request }) => {
    const body = await request.formData()
    const action = body.get('action')
    if (action === 'cancel') return redirect('/merge-identity/cancel')
    else if (action === 'confirm') return redirect('/merge-identity/confirm')
  }
)

type LoaderData = {
  alias: string
}

export default function Prompt() {
  const { dark } = useContext(ThemeContext)
  const { alias } = useLoaderData<LoaderData>()
  const [selectedOption, setSelectedOption] = useState('cancel')

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
            <div className="flex flex-col w-[512px] min-h-fit m-auto p-6 space-y-8 box-border bg-white dark:bg-[#1F2937] border rounded-lg  border-[#D1D5DB] dark:border-gray-600">
              <div className="flex space-x-2">
                <div>
                  <div>
                    <img
                      src={dangerVector}
                      className="inline-block mr-4"
                      alt="danger"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Text className="dark:text-white leading-6" size="lg">
                    Account{' '}
                    <Text type="span" weight="bold">
                      {alias}
                    </Text>{' '}
                    is already connected to different identity.
                  </Text>
                  <Text className="text-gray-500 dark:text-[#6B7280]" size="sm">
                    How would you like to continue?
                  </Text>
                </div>
              </div>
              <Form method="post">
                <div className="flex flex-col space-y-4">
                  <Option
                    action="cancel"
                    title="Use Different Account"
                    checked={selectedOption === 'cancel'}
                    onChange={() => setSelectedOption('cancel')}
                  />
                  <Option
                    action="confirm"
                    title="Merge Identity"
                    checked={selectedOption === 'confirm'}
                    onChange={() => setSelectedOption('confirm')}
                  >
                    <div className="ml-7">
                      <Text
                        size="sm"
                        type="span"
                        className="leading-4 font-normal text-gray-500"
                      >
                        This action permanently transfers{' '}
                        <Text size="sm" type="span" weight="bold">
                          all accounts
                        </Text>{' '}
                        from one identity to other.
                      </Text>
                    </div>
                  </Option>
                  <div className="flex justify-end">
                    <Button type="submit" btnType="primary-alt">
                      Continue
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type OptionProps = {
  action: string
  title: string
  checked?: boolean
  onChange: () => unknown
  children?: JSX.Element
}

const Option = ({
  action,
  title,
  checked = false,
  onChange,
  children,
}: OptionProps) => (
  <label
    className={`p-4 text-gray-800 dark:text-white ${
      checked ? 'bg-[#EEF2FF] dark:bg-[#374151]' : 'dark:bg-[#25303F]'
    } border rounded-md border-gray-200 dark:border-gray-600`}
  >
    <div className="flex items-center space-x-3">
      <input
        type="radio"
        name="action"
        value={action}
        checked={checked}
        onChange={onChange}
        className="checked:text-indigo-600 focus:ring-indigo-600"
      />
      <Text size="sm" type="span" weight="medium" className="leading-6">
        {title}
      </Text>
    </div>
    {children}
  </label>
)
