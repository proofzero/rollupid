import { Form, Link, useActionData, useOutletContext } from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { Panel } from '@proofzero/design-system/src/atoms/panels/Panel'
import { useState, Fragment, useEffect } from 'react'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'

import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { TbInfoCircle } from 'react-icons/tb'
import zerodevIcon from '~/assets/paymasters/zerodev.svg'

import type { ActionFunction } from '@remix-run/cloudflare'
import type { notificationHandlerType } from '~/types'
import type {
  PaymasterType,
  PaymasterProviderType,
} from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

type errorsType = {
  label?: string
  paymaster?: string
}

type paymasterType = {
  provider?: string
  icon?: string
  name?: string
  secretLabel?: string
  secretPlaceholder?: string
  unavailable?: boolean
}

const availablePaymasters: paymasterType[] = [
  {
    name: 'ZeroDev',
    icon: zerodevIcon,
    provider: 'zerodev',
    secretLabel: 'Project ID',
    secretPlaceholder: 'ZeroDev project ID',
    unavailable: false,
  },
]

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Application Client ID is required for the requested route',
      })
    }
    const jwt = await requireJWT(request, context.env)
    let errors: errorsType = {}
    const starbaseClient = createStarbaseClient(context.env.Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const formData = await request.formData()

    //due to specificity of formData inputs
    const paymaster = formData.get(
      'paymaster[provider]'
    ) as PaymasterProviderType

    if (!paymaster) {
      errors.paymaster = 'Paymaster is required'
    }

    const secret = formData.get('secret') as string
    if (!secret) {
      errors.label = `Provider secret is required`
    }
    try {
      await starbaseClient.setPaymaster.mutate({
        clientId: params.clientId,
        paymaster: { provider: paymaster, secret },
      })
    } catch (e) {
      errors.paymaster = `Error updating paymaster's secret`
    }

    return { errors }
  }
)

export default () => {
  const { paymaster, notificationHandler } = useOutletContext<{
    paymaster: PaymasterType
    notificationHandler: notificationHandlerType
  }>()

  const [isFormChanged, setIsFormChanged] = useState(false)

  const actionData = useActionData()
  const errors = actionData?.errors

  useEffect(() => {
    if (errors) {
      notificationHandler(Object.keys(errors).length === 0)
      setIsFormChanged(!(Object.keys(errors).length === 0))
    }
  }, [errors])

  const [selectedPaymaster, setSelectedPaymaster] = useState(() => {
    if (paymaster?.provider) {
      return availablePaymasters.find(
        (avPaymaster) => paymaster.provider === avPaymaster.provider
      )
    }
    return {} as paymasterType
  })

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      onChange={() => {
        setIsFormChanged(true)
      }}
    >
      <section className="flex flex-col space-y-5">
        <div className="flex flex-row justify-between space-x-5 max-sm:pl-6">
          <div className="flex flex-row items-center space-x-3">
            <Text size="2xl" weight="semibold" className="text-gray-900">
              Blockchain
            </Text>
            <DocumentationBadge
              url={'https://docs.rollup.id/platform/console/blockchain'}
            />
          </div>
          <Button
            type="submit"
            btnType="primary-alt"
            disabled={!isFormChanged || !selectedPaymaster?.provider}
          >
            Save
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-5 lg:space-y-0 lg:space-x-5">
          <Panel title="Account Abstraction" experimental={true}>
            <Text size="sm" className="text-gray-500 pb-3">
              Account Abstraction simplifies the process of handling
              cryptocurrency payments by facilitating the sponsorship or
              subsidization of gas and other expenses on behalf of the user. You
              can get the API key and instruction from our{' '}
              <Link
                to="https://docs.rollup.id/platform/console/blockchain"
                target="blank"
                className="text-indigo-500 hover:underline"
              >
                list of supported Paymaster Providers
              </Link>
            </Text>
            <div className="flex flex-col sm:flex-row relative sm:space-x-10">
              <Listbox
                value={selectedPaymaster}
                onChange={setSelectedPaymaster}
                as="div"
                name="paymaster"
                className="mt-auto sm:grow-[1] max-sm:mb-2 "
              >
                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                  Paymaster Provider
                </Listbox.Label>
                <div className="relative bottom-0">
                  <Listbox.Button
                    className="relative w-full cursor-default rounded
                   bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm
                   border-gray-300 border focus:ring-1 focus:border-indigo-500 ring-indigo-500"
                  >
                    <div className={`block truncate text-sm text-gray-400`}>
                      {selectedPaymaster?.provider ? (
                        <div className="flex flex-row w-full items-center">
                          <img
                            src={selectedPaymaster.icon}
                            alt="icon"
                            className="w-6 h-6 mr-3"
                          />
                          <span className={`truncate text-sm`}>
                            {selectedPaymaster.name}
                          </span>
                        </div>
                      ) : (
                        "Select a paymaster's provider"
                      )}
                    </div>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options
                      className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-sm
                     ring-1 ring-black ring-opacity-5  sm:text-sm"
                    >
                      {availablePaymasters.map((paymaster, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 px-3
                            ${active
                              ? 'bg-gray-50 text-indigo-900'
                              : 'text-gray-900'
                            } }`
                          }
                          value={paymaster}
                        >
                          {({ selected }) => {
                            return (
                              <div className="flex flex-row w-full items-center">
                                <img
                                  src={paymaster.icon}
                                  alt="icon"
                                  className="w-6 h-6 mr-3"
                                />
                                <span
                                  className={`truncate text-sm ${selected ? 'font-medium' : 'font-normal'
                                    }`}
                                >
                                  {paymaster.name}
                                </span>
                                {selected ? (
                                  <span className="ml-auto text-indigo-600">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </div>
                            )
                          }}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <div className="sm:grow-[3]">
                <Input
                  id="secret"
                  label={selectedPaymaster?.secretLabel || 'API Key'}
                  type="text"
                  className="shadow-sm w-full"
                  placeholder={selectedPaymaster?.secretPlaceholder}
                  defaultValue={paymaster?.secret}
                  docsUrl={
                    'https://docs.rollup.id/platform/console/blockchain#preferred-paymasters'
                  }
                />
              </div>
            </div>
            <div
              className="bg-gray-50 mt-7 p-4 rounded-lg flex flex-row
            justify-start items-start space-x-3"
            >
              <TbInfoCircle size={20} className="text-gray-500 shrink-0" />
              <Text className="text-gray-500">
                NOTE: Your paymaster credential will only be used to sponsor
                fees when registering and revoking session keys with your users
                smart contract wallets. Please refer to your providers
                documentation for submitting user operations with your session
                keys
              </Text>
            </div>
          </Panel>
        </div>
      </section>
    </Form>
  )
}
