import { Form, Link } from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { Panel } from '@proofzero/design-system/src/atoms/panels/Panel'
import { useState, Fragment } from 'react'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'

import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const paymasters = [
  { name: 'Not Selected', value: '', id: 'not_selected', unavailable: true },
  { name: 'ZeroDev', value: 'zerodev', id: 'zerodev', unavailable: false },
]

export default () => {
  const [selectedPaymaster, setSelectedPaymaster] = useState(paymasters[0])
  const [isFormChanged, setIsFormChanged] = useState(false)

  return (
    <>
      <Form
        method="post"
        encType="multipart/form-data"
        onChange={() => {
          setIsFormChanged(true)
        }}
      >
        <input type="hidden" name="op" value="update_app" />

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
              disabled={!isFormChanged}
            >
              Save
            </Button>
          </div>

          <div className="flex flex-col md:flex-row space-y-5 lg:space-y-0 lg:space-x-5">
            <Panel title="Account Abstraction">
              <Text size="sm" className="text-gray-500 pb-3">
                Account Abstraction simplifies the process of handling
                cryptocurrency payments by facilitating the sponsorship or
                subsidization of gas and other expenses on behalf of the user.
                You can get the API key and instruction from our{' '}
                <Link
                  to="https://docs.rollup.id/platform/console/blockchain"
                  target="blank"
                  className="text-indigo-500 hover:underline"
                >
                  list of supported Paymaster Providers
                </Link>
              </Text>
              <div className="flex flex-row relative space-x-10">
                <Listbox
                  value={selectedPaymaster}
                  onChange={setSelectedPaymaster}
                  as="div"
                  className="mt-auto grow-[1]"
                >
                  <Listbox.Label className="block text-sm font-medium text-gray-700 mb-2">
                    Paymaster Provider
                  </Listbox.Label>
                  <div className="relative border rounded-md bottom-0">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate">
                        {selectedPaymaster.name}
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
                        {paymasters.map((paymaster, personIdx) => (
                          <Listbox.Option
                            key={personIdx}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4
                            ${
                              active
                                ? 'bg-indigo-100 text-indigo-900'
                                : paymaster.id === 'not_selected'
                                ? 'bg-gray-50'
                                : 'text-gray-900'
                            } }`
                            }
                            disabled={paymaster.id === 'not_selected'}
                            value={paymaster}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
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
                <div className="grow-[2]">
                  <Input
                    id="apiKey"
                    disabled={selectedPaymaster.id === 'not_selected'}
                    label="API Key"
                    type="text"
                    className="shadow-md"
                    // error={errors?.['termsURL']}
                    // placeholder="www.example.com"
                    // defaultValue={appDetails.app.termsURL}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </Form>
    </>
  )
}
