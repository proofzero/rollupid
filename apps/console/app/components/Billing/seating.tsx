import { Listbox, Transition } from '@headlessui/react'
import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { IDENTITY_GROUP_OPTIONS } from '@proofzero/platform/identity/src/constants'
import { PaymentData } from '@proofzero/types/billing'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { Link } from '@remix-run/react'
import classnames from 'classnames'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import {
  HiArrowNarrowRight,
  HiChevronDown,
  HiChevronUp,
  HiMinus,
  HiOutlineShoppingCart,
  HiOutlineX,
  HiPlus,
} from 'react-icons/hi'

const seatingCost = 42

export const PurchaseGroupSeatingModal = ({
  isOpen,
  setIsOpen,
  groupID,
  paymentData,
  purchaseFn,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  groupID: string
  paymentData?: PaymentData
  purchaseFn: (quantity: number) => void
}) => {
  const [seatCountDelta, setSeatCountDelta] = useState(1)

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div className="flex flex-row justify-between w-full pt-5 pb-3 px-5 items-center">
          <Text
            size="lg"
            weight="semibold"
            className="text-left text-gray-800 "
          >
            Purchase Additional User Seats
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                        hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>

        {!paymentData?.paymentMethodID && (
          <section className="mx-5 mb-3">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={
                paymentData?.customerID
                  ? `/billing/payment?URN=${IdentityGroupURNSpace.urn(groupID)}`
                  : `/billing/groups/${groupID}`
              }
              type={'warning'}
              linkText="Update payment information"
            />
          </section>
        )}

        <section className="mx-5 mb-5 border rounded-lg overflow-auto thin-scrollbar">
          <div className="p-6">
            <Text
              size="lg"
              weight="semibold"
              className="text-gray-900 text-left"
            >
              Additional User Seats
            </Text>

            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 text-left mb-6"
            >
              Each group has {IDENTITY_GROUP_OPTIONS.maxFreeMembers} free user
              seats. If you wish to add more than{' '}
              {IDENTITY_GROUP_OPTIONS.maxFreeMembers} members, additional seats
              need to be purchased.
            </Text>
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <div>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Additional User Seats
              </Text>
              <Text
                size="sm"
                weight="medium"
                className="text-gray-500 text-left"
              >
                {seatCountDelta} x ${seatingCost}/month
              </Text>
            </div>

            <div className="flex flex-row">
              <button
                type="button"
                className="flex justify-center items-center border
                disabled:cursor-not-allowed
                border-gray-300 bg-gray-50 rounded-l-lg px-4"
                disabled={seatCountDelta <= 1}
                onClick={() => {
                  setSeatCountDelta((prev) => prev - 1)
                }}
              >
                <HiMinus />
              </button>

              <input
                type="text"
                className="border border-x-0 text-center w-[4rem] border-gray-300 focus:ring-0 focus:outline-0 focus:border-gray-300"
                readOnly
                value={seatCountDelta}
              />

              <button
                type="button"
                className="flex justify-center items-center border border-gray-300 bg-gray-50 rounded-r-lg px-4"
                onClick={() => {
                  setSeatCountDelta((prev) => prev + 1)
                }}
              >
                <HiPlus />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200"></div>

          <div className="p-6 flex justify-between items-center">
            <Text size="sm" weight="medium" className="text-gray-800 text-left">
              Changes to your subscription
            </Text>

            <div className="flex flex-row gap-2 items-center">
              <Text size="lg" weight="semibold" className="text-gray-900">{`+$${
                seatingCost * seatCountDelta
              }`}</Text>
              <Text size="sm" weight="medium" className="text-gray-500">
                per month
              </Text>
            </div>
          </div>
        </section>

        <div className="flex-1"></div>

        <section className="flex flex-row-reverse gap-4 m-5 mt-auto">
          <Button
            btnType="primary-alt"
            onClick={() => {
              setIsOpen(false)
              setSeatCountDelta(1)
              purchaseFn(seatCountDelta)
            }}
            disabled={!paymentData?.paymentMethodID}
          >
            Purchase
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

export const RemoveGroupSeatingModal = ({
  isOpen,
  setIsOpen,
  removalFn,
  seatsUsed,
  totalSeats,
  paymentIsSetup,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  removalFn: (quantity: number) => void
  seatsUsed: number
  totalSeats: number
  paymentIsSetup: boolean
}) => {
  const [seatsNew, setSeatsNew] = useState(seatsUsed)
  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="max-sm:w-screen sm:min-w-[640px] lg:min-w-[764px] w-fit">
        <div className="pb-2 pt-5 px-5 w-full flex flex-row items-center justify-between">
          <Text size="lg" weight="semibold" className="text-left text-gray-800">
            Remove Additional User Seat(s)
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                  hover:bg-[#F3F4F6]`}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            <HiOutlineX />
          </div>
        </div>
        <section className="p-5 pt-auto w-full">
          <div className="w-full border rounded-lg overflow-auto thin-scrollbar">
            <div className="p-6">
              <Text
                size="lg"
                weight="semibold"
                className="text-gray-900 text-left"
              >
                Additional User Seats
              </Text>
              <ul className="pl-4">
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You are currently using {seatsUsed}/{totalSeats} Additional
                  User Seats
                </li>
                <li className="list-disc text-sm font-medium text-gray-500 text-left">
                  You can remove some Members of your Group if you'd like to pay
                  for fewer Seats.
                </li>
              </ul>
            </div>
            <div className="border-b border-gray-200"></div>
            <div className="p-6 flex justify-between items-center">
              <div>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-800 text-left"
                >
                  Number of Additional Seats
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 text-left"
                >{`${totalSeats} x ${seatingCost}/month`}</Text>
              </div>

              <div className="flex flex-row text-gray-500 space-x-4">
                <div className="flex flex-row items-center space-x-2">
                  <Text size="sm">{totalSeats} Seat(s)</Text>
                  <HiArrowNarrowRight />
                </div>

                <div className="flex flex-row">
                  <Listbox
                    value={seatsNew}
                    onChange={setSeatsNew}
                    disabled={seatsUsed === totalSeats}
                    as="div"
                  >
                    {({ open }) => {
                      return (
                        <div>
                          <Listbox.Button
                            className="relative w-full cursor-default border
              py-1.5 px-4 text-left sm:text-sm rounded-lg
              focus:border-indigo-500 focus:outline-none focus:ring-1
              flex flex-row space-x-3 items-center"
                          >
                            <Text size="sm">{seatsNew}</Text>
                            {open ? (
                              <HiChevronUp className="text-right" />
                            ) : (
                              <HiChevronDown className="text-right" />
                            )}
                          </Listbox.Button>
                          <Transition
                            show={open}
                            as="div"
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            className="bg-gray-800"
                          >
                            <Listbox.Options
                              className="absolute no-scrollbar w-full bg-white
                    rounded-lg border max-h-[150px] max-w-[66.1833px] overflow-auto"
                            >
                              {Array.apply(null, Array(totalSeats + 1)).map(
                                (_, i) => {
                                  return i >= seatsUsed ? (
                                    <Listbox.Option
                                      key={i}
                                      value={i}
                                      className="flex items-center
                            cursor-pointer hover:bg-gray-100
                            rounded-lg m-1"
                                    >
                                      {({ selected }) => {
                                        return (
                                          <div
                                            className={`w-full h-full px-4 py-1.5
                                  rounded-lg ${
                                    selected ? 'bg-gray-100  font-medium' : ''
                                  }`}
                                          >
                                            {i}
                                          </div>
                                        )
                                      }}
                                    </Listbox.Option>
                                  ) : null
                                }
                              )}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      )
                    }}
                  </Listbox>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200"></div>

            <div className="p-6 flex justify-between items-center">
              <Text
                size="sm"
                weight="medium"
                className="text-gray-800 text-left"
              >
                Changes to your subscription
              </Text>

              <div className="flex flex-row gap-2 items-center">
                <Text size="lg" weight="semibold" className="text-gray-900">{`${
                  seatingCost * (totalSeats - seatsNew) !== 0 ? '-' : ''
                }$${seatingCost * (totalSeats - seatsNew)}`}</Text>
                <Text size="sm" weight="medium" className="text-gray-500">
                  per month
                </Text>
              </div>
            </div>
          </div>
        </section>
        <section className="flex flex-row-reverse gap-4 mt-auto m-5">
          <Button
            btnType="dangerous-alt"
            disabled={
              !paymentIsSetup ||
              seatsUsed === totalSeats ||
              seatsNew < seatsUsed ||
              seatsNew === totalSeats
            }
            onClick={() => {
              setIsOpen(false)
              setSeatsNew(seatsNew)

              removalFn(seatsNew)
            }}
          >
            Remove Seat(s)
          </Button>
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </section>
      </div>
    </Modal>
  )
}

export const GroupSeatingCard = ({
  groupID,
  seatsTotal,
  seatsUsed,
  paymentData,
  purchaseFn,
  removalFn,
}: {
  groupID: string
  seatsTotal: number
  seatsUsed: number
  paymentData?: PaymentData
  purchaseFn: (quantity: number) => void
  removalFn: (quantity: number) => void
}) => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false)

  return (
    <>
      <PurchaseGroupSeatingModal
        isOpen={isPurchaseModalOpen}
        setIsOpen={setIsPurchaseModalOpen}
        groupID={groupID}
        paymentData={paymentData}
        purchaseFn={purchaseFn}
      />

      <RemoveGroupSeatingModal
        isOpen={isRemovalModalOpen}
        setIsOpen={setIsRemovalModalOpen}
        removalFn={removalFn}
        seatsUsed={seatsUsed}
        totalSeats={seatsTotal}
        paymentIsSetup={Boolean(paymentData?.paymentMethodID)}
      />

      <article className="bg-white rounded-lg border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
          <div>
            <Text size="lg" weight="semibold" className="text-gray-900">
              Additional User Seats
            </Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              Each group has {IDENTITY_GROUP_OPTIONS.maxFreeMembers} free user
              seats. If you wish to add more than{' '}
              {IDENTITY_GROUP_OPTIONS.maxFreeMembers} members, additional seats
              need to be purchased.
            </Text>
          </div>

          <div className="flex flex-row items-center space-x-2">
            <Button
              btnType="secondary-alt"
              className={classnames(
                'flex flex-row items-center gap-3',
                'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              <HiOutlineShoppingCart className="w-3.5 h-3.5" />

              <Text size="sm" weight="medium">
                Purchase
              </Text>
            </Button>
          </div>
        </header>
        <div className="w-full border-b border-gray-200"></div>
        {seatsTotal > 0 && (
          <>
            <main>
              <div className="p-4">
                <div className="flex flex-row items-center gap-6">
                  <div className="flex-1">
                    <Text size="sm" weight="medium" className="text-gray-900">
                      Additional Seats
                    </Text>

                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 my-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${(seatsUsed / seatsTotal) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-row items-center">
                      <div className="flex-1">
                        <Link to={`/groups/${groupID}`}>
                          <button
                            type="button"
                            className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                          >
                            <Text size="sm" weight="medium">
                              Manage Seat Assignments
                            </Text>
                          </button>
                        </Link>
                      </div>
                      <Text size="sm" weight="medium" className="text-gray-500">
                        {`${seatsUsed} out of ${seatsTotal} Additional Seats used`}
                      </Text>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-2">
                    <Text size="lg" weight="semibold" className="text-gray-900">
                      {`$${seatingCost * seatsTotal}`}
                    </Text>
                    <Text size="sm" className="text-gray-500">
                      per month
                    </Text>
                  </div>
                </div>
              </div>
            </main>
            <footer>
              {seatsTotal === 0 && (
                <div className="bg-gray-50 rounded-b-lg py-4 px-6">
                  <button
                    type="button"
                    className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                    onClick={() => setIsPurchaseModalOpen(true)}
                  >
                    <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                    <Text size="sm" weight="medium">
                      Purchase Seats
                    </Text>
                  </button>
                </div>
              )}

              {seatsUsed < seatsTotal && (
                <div className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer bg-gray-50 rounded-b-lg py-4 px-6">
                  <button
                    type="button"
                    className="flex flex-row items-center gap-3.5 text-indigo-500 cursor-pointer rounded-b-lg disabled:text-indigo-300"
                    onClick={() => setIsRemovalModalOpen(true)}
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                    <Text size="sm" weight="medium">
                      Remove Unused Seats
                    </Text>
                  </button>
                </div>
              )}
            </footer>
          </>
        )}
      </article>
    </>
  )
}
