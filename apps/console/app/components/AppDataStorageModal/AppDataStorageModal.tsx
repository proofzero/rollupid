import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Button, Text } from '@proofzero/design-system'
import { FetcherWithComponents } from '@remix-run/react'

import ExternalAppDataPackages from '@proofzero/utils/externalAppDataPackages'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { useEffect, useState } from 'react'
import { HiOutlineX } from 'react-icons/hi'

type AppDataStorageModalProps = {
  isOpen: boolean
  onClose: () => void
  subscriptionFetcher: FetcherWithComponents<any>
  currentPackage?: ExternalAppDataPackageType
  clientID: string
}

const AppDataStorageModal: React.FC<AppDataStorageModalProps> = ({
  isOpen,
  onClose,
  subscriptionFetcher,
  currentPackage,
  clientID,
}) => {
  const [selectedPackage, setSelectedPackage] =
    useState<ExternalAppDataPackageType>(
      currentPackage ?? ExternalAppDataPackageType.STARTER
    )
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
              <Text size="xs" className="text-gray-500 uppercase text-left">
                Choose Package
              </Text>
              <div className="text-left flex flex-row items-center gap-1.5">
                <Button
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

          <footer className="flex flex-row items-center justify-end gap-2">
            <Button btnType="secondary-alt" onClick={() => onClose()}>
              Close
            </Button>
            <Button btnType="primary-alt" type="submit">
              Change Subscription
            </Button>
          </footer>
        </subscriptionFetcher.Form>
      </Modal>
    </>
  )
}

export default AppDataStorageModal
