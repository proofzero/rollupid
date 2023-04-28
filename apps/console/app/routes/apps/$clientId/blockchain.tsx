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

import type { ActionFunction } from '@remix-run/cloudflare'
import type { notificationHandlerType } from '~/types'
import type {
  PaymasterType,
  PaymasterProviderType,
} from '@proofzero/platform/starbase/src/jsonrpc/validators/app'

type errorsType = {
  label?: string
  paymaster?: string
}

type paymasterType = {
  provider?: string
  name?: string
  secretLabel?: string
  secretPlaceholder?: string
  unavailable?: boolean
}

const availablePaymasters: paymasterType[] = [
  {
    name: 'ZeroDev',
    provider: 'zerodev',
    secretLabel: 'Project ID',
    secretPlaceholder: 'ZeroDev project ID',
    unavailable: false,
  },
]

export const action: ActionFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Application Client ID is required for the requested route')
  }
  const jwt = await requireJWT(request)
  let errors: errorsType = {}
  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const formData = await request.formData()

  //due to specificity of formData inputs
  const paymaster = formData.get('paymaster[provider]') as PaymasterProviderType

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
          <Panel title="Account Abstraction">
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
                className="mt-auto sm:grow-[2] max-sm:mb-2"
              >
                <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                  Paymaster Provider
                </Listbox.Label>
                <div className="relative border rounded bottom-0">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span
                      className={`block truncate text-sm ${
                        selectedPaymaster?.name ? '' : 'text-gray-400'
                      }`}
                    >
                      {selectedPaymaster?.name ||
                        "Select a paymaster's provider"}
                    </span>
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
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {availablePaymasters.map((paymaster, personIdx) => (
                        <Listbox.Option
                          key={personIdx}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4
                            ${
                              active
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'text-gray-900'
                            } }`
                          }
                          value={paymaster}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate text-sm ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {paymaster.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <div className="sm:grow-[5]">
                <Input
                  id="secret"
                  label={selectedPaymaster?.secretLabel || 'API Key'}
                  type="text"
                  className="shadow-md w-full"
                  placeholder={selectedPaymaster?.secretPlaceholder}
                  defaultValue={paymaster?.secret}
                />
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </Form>
  )
}
