import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Button, Text } from '@proofzero/design-system'
import { FetcherWithComponents } from '@remix-run/react'

import ExternalAppDataPackages from '@proofzero/utils/externalAppDataPackages'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { useEffect, useState } from 'react'
import { HiOutlineX } from 'react-icons/hi'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { FaCheck, FaTimes } from 'react-icons/fa'

type AppDataStorageModalProps = {
  isOpen: boolean
  onClose: () => void
  subscriptionFetcher: FetcherWithComponents<any>
  currentPackage?: ExternalAppDataPackageType
  topUp?: boolean
  clientID: string
}

const AppDataStorageModal: React.FC<AppDataStorageModalProps> = ({
  isOpen,
  onClose,
  subscriptionFetcher,
  currentPackage,
  topUp = false,
  clientID,
}) => {
  const [selectedPackage, setSelectedPackage] =
    useState<ExternalAppDataPackageType>(
      currentPackage ?? ExternalAppDataPackageType.STARTER
    )
  const [autoTopUp, setAutoTopUp] = useState(topUp)

  useEffect(() => {
    if (currentPackage) {
      setSelectedPackage(currentPackage)
    }
  }, [currentPackage])
  return (
    <>
      <Modal isOpen={isOpen} handleClose={() => onClose()}>
        <subscriptionFetcher.Form
          method="post"
          action={`/apps/${clientID}/storage/ostrich`}
          className="flex flex-col gap-4 p-5"
        >
          {selectedPackage && <input type="hidden" name="op" value="enable" />}
          {selectedPackage && (
            <input type="hidden" name="package" value={selectedPackage} />
          )}
          <header className="flex flex-row justify-between w-full mb-3 items-center">
            <Text
              size="lg"
              weight="semibold"
              className="text-left text-gray-800"
            >
              Purchase Entitlement(s)
            </Text>
            <button
              className="bg-white p-2 rounded-lg text-xl cursor-pointer hover:bg-[#F3F4F6]"
              onClick={() => onClose()}
            >
              <HiOutlineX />
            </button>
          </header>

          <section className="flex flex-col gap-4">
            <div>
              <Text
                size="xs"
                className="text-gray-500 uppercase text-left mb-2"
              >
                Choose Package
              </Text>
              <div className="text-left flex flex-row items-center gap-1.5">
                <Button
                  disabled={subscriptionFetcher.state !== 'idle'}
                  btnType={
                    selectedPackage === ExternalAppDataPackageType.STARTER
                      ? 'secondary'
                      : 'secondary-alt'
                  }
                  onClick={() => {
                    setSelectedPackage(ExternalAppDataPackageType.STARTER)
                  }}
                >
                  {
                    ExternalAppDataPackages[ExternalAppDataPackageType.STARTER]
                      .title
                  }
                </Button>
                <Button
                  disabled={subscriptionFetcher.state !== 'idle'}
                  btnType={
                    selectedPackage === ExternalAppDataPackageType.SCALE
                      ? 'secondary'
                      : 'secondary-alt'
                  }
                  onClick={() => {
                    setSelectedPackage(ExternalAppDataPackageType.SCALE)
                  }}
                >
                  {
                    ExternalAppDataPackages[ExternalAppDataPackageType.SCALE]
                      .title
                  }
                </Button>
              </div>
            </div>

            <div className="flex flex-col border rounded">
              <div className="flex flex-row items-center justify-between px-4 py-2">
                <Text size="sm" weight="medium" className="text-gray-800">
                  Reads:
                </Text>
                <Text size="sm" weight="medium" className="text-gray-500">
                  {ExternalAppDataPackages[selectedPackage].reads}
                </Text>
              </div>
              <div className="w-full h-px bg-gray-200"></div>
              <div className="flex flex-row items-center justify-between px-4 py-2">
                <Text size="sm" weight="medium" className="text-gray-800">
                  Writes:
                </Text>
                <Text size="sm" weight="medium" className="text-gray-500">
                  {ExternalAppDataPackages[selectedPackage].writes}
                </Text>
              </div>
            </div>
          </section>

          <section className="flex flex-col">
            <Text size="xs" className="text-gray-500 uppercase text-left mb-2">
              Auto Top-Up
            </Text>

            <div className="flex flex-row items-start gap-2 border rounded px-4 py-2">
              <Text
                className="flex-1 text-gray-500 max-w-[638px] text-left"
                size="sm"
              >
                When enabled it allows for automatic package purchasing to
                prevent stopping services from running if you ever ran out of
                units. The unused value of the top-up carries over to the next
                billing cycle.
              </Text>

              <InputToggle
                id="top-up"
                checked={autoTopUp}
                onToggle={(val) => setAutoTopUp(val)}
                disabled={subscriptionFetcher.state !== 'idle'}
              />
            </div>
          </section>

          <section className="flex flex-row border rounded px-4 py-2 justify-between items-center">
            <Text size="sm" className="text-gray-800">
              Changes to your subscription
            </Text>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between items-center">
                <span>
                  {autoTopUp ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </span>
                <Text type="span" size="sm" className="text-gray-800">
                  Auto top-up
                </Text>
              </div>
            </div>
          </section>

          <footer className="flex flex-row items-center justify-end gap-2">
            <Button btnType="secondary-alt" onClick={() => onClose()}>
              Close
            </Button>
            <Button
              btnType="primary-alt"
              type="submit"
              disabled={subscriptionFetcher.state !== 'idle'}
            >
              Change Subscription
            </Button>
          </footer>
        </subscriptionFetcher.Form>
      </Modal>
    </>
  )
}

export default AppDataStorageModal
