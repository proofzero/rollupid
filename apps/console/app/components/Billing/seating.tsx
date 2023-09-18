import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { PaymentData } from '@proofzero/types/billing'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { Link } from '@remix-run/react'
import classnames from 'classnames'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import {
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
  paymentIsSetup,
  purchaseFn,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  groupID: string
  paymentIsSetup: boolean
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

        {!paymentIsSetup && (
          <section className="mx-5 mb-3">
            <ToastWithLink
              message="Update your Payment Information to enable purchasing"
              linkHref={`/billing/payment?URN=${IdentityGroupURNSpace.urn(
                groupID
              )}`}
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
              Each group has 3 free user seats. If you wish to add more than 3
              members, additional seats need to be purchased.
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

export const GroupSeatingCard = ({
  groupID,
  seatsTotal,
  seatsUsed,
  paymentData,
  purchaseFn,
}: {
  groupID: string
  seatsTotal: number
  seatsUsed: number
  paymentData?: PaymentData
  purchaseFn: (quantity: number) => void
}) => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)

  return (
    <>
      <PurchaseGroupSeatingModal
        isOpen={isPurchaseModalOpen}
        setIsOpen={setIsPurchaseModalOpen}
        groupID={groupID}
        paymentIsSetup={Boolean(paymentData?.paymentMethodID)}
        purchaseFn={purchaseFn}
      />

      <article className="bg-white rounded-lg border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4 relative">
          <div>
            <Text size="lg" weight="semibold" className="text-gray-900">
              Additional User Seats
            </Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              Each group has 3 free user seats. If you wish to add more than 3
              members, additional seats need to be purchased.
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
                        <Link to={`/spuorg/${groupID}`}>
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
