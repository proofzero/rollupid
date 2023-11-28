import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { AccountURN } from '@proofzero/urns/account'
import { FetcherWithComponents } from '@remix-run/react'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { TbInfoCircle } from 'react-icons/tb'

const EditProfileModal: React.FC<{
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  accounts: {
    URN: AccountURN
    icon?: string
    title: string
  }[]
  primaryAccountURN: AccountURN
  fetcher: FetcherWithComponents<any>
}> = ({ isOpen, setIsOpen, accounts, primaryAccountURN, fetcher }) => {
  const [selectedAccount, setSelectedAccount] = useState(
    accounts.find((a) => a.URN === primaryAccountURN)
  )

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsOpen(false)
    }
  }, [fetcher])

  const handleClose = () => {
    setIsOpen(false)
    setSelectedAccount(accounts.find((a) => a.URN === primaryAccountURN))
  }

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} overflowAbsolute={true}>
      <div className="w-fit rounded-lg bg-white p-4 text-left transition-all sm:p-5">
        <section>
          <Text size="lg" weight="semibold">
            Passport Profile
          </Text>
        </section>

        <section className="flex flex-row justify-start items-center gap-2 bg-gray-100 rounded-lg p-4">
          <TbInfoCircle className="h-7 w-7 text-gray-500" />
          <Text size="sm" weight="normal" className="text-gray-500">
            Passport Profile sets your default name and profile picture that is
            shared with authorized applications. <br />
            You can edit both in Profile Settings.
          </Text>
        </section>

        <section>
          <Text>Source</Text>
          <Listbox
            value={selectedAccount}
            onChange={setSelectedAccount}
            name="account"
            by="URN"
          >
            {({ open }) => (
              <div className="flex flex-col col-span-2 z-10">
                <Listbox.Button className="relative border rounded-lg py-2 px-3 flex flex-row justify-between items-center flex-1 focus-visible:outline-none focus:border-indigo-500 bg-white disabled:bg-gray-100 px-2 border-gray-300">
                  <div className="flex flex-row items-center gap-2">
                    {!selectedAccount?.icon && (
                      <div className="rounded-full w-5 h-5 bg-gray-200"></div>
                    )}
                    {selectedAccount?.icon && (
                      <img
                        src={selectedAccount.icon}
                        className="object-cover w-5 h-5 rounded-full"
                        alt="app icon"
                      />
                    )}
                    <Text size="sm" weight="normal" className="text-gray-800">
                      {selectedAccount?.title}
                    </Text>
                  </div>

                  {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </Listbox.Button>

                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options
                    className="absolute bg-white p-2 flex flex-col gap-2 mt-1 focus-visible:ring-0 focus-visible:outline-none border shadow w-full"
                    static
                  >
                    {accounts.map((account) => (
                      <Listbox.Option
                        key={account.URN}
                        value={account}
                        className={({ active }) =>
                          classNames(
                            'flex flex-row items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-lg cursor-pointer',
                            {
                              'bg-gray-100': active,
                            }
                          )
                        }
                      >
                        {({ selected }) => (
                          <article className="flex flex-row items-center justify-between w-full">
                            <div className="flex flex-row items-center gap-2">
                              {!account.icon && (
                                <div className="rounded-full w-5 h-5 bg-gray-200"></div>
                              )}
                              {account.icon && (
                                <img
                                  src={account.icon}
                                  className="object-cover w-5 h-5 rounded-full"
                                  alt="app icon"
                                />
                              )}
                              <Text
                                size="sm"
                                weight="normal"
                                className="text-gray-800"
                              >
                                {account.title}
                              </Text>
                            </div>

                            {selected && (
                              <CheckIcon
                                className="h-5 w-5 text-indigo-600"
                                aria-hidden="true"
                              />
                            )}
                          </article>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>
        </section>

        <section>
          <fetcher.Form method="post" action="/settings/accounts">
            {selectedAccount && (
              <input
                type="hidden"
                name="primaryAccount"
                value={JSON.stringify({
                  id: selectedAccount.URN,
                  icon: selectedAccount.icon,
                  title: selectedAccount.title,
                })}
              />
            )}

            <Button btnType="secondary-alt" onClick={handleClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              btnType="primary-alt"
              disabled={
                !selectedAccount ||
                selectedAccount.URN === primaryAccountURN ||
                fetcher.state !== 'idle'
              }
            >
              Save
            </Button>
          </fetcher.Form>
        </section>
      </div>
    </Modal>
  )
}

export default EditProfileModal
