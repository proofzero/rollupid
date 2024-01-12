import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Button, Text } from '@proofzero/design-system'
import { FetcherWithComponents } from '@remix-run/react'

import ExternalAppDataPackages from '@proofzero/utils/externalAppDataPackages'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { useEffect, useState } from 'react'

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
  useEffect(() => {
    if (
      subscriptionFetcher.state === 'idle' &&
      subscriptionFetcher.type === 'done'
    ) {
      onClose()
    }
  }, [subscriptionFetcher])
  return (
    <>
      <Modal isOpen={isOpen} handleClose={onClose}>
        <subscriptionFetcher.Form
          method="post"
          action={`/apps/${clientID}/storage/ostrich`}
        >
          {selectedPackage && <input type="hidden" name="op" value="enable" />}
          <header>
            <Text>App Data Storage</Text>
          </header>

          <section>
            <div>
              <Text>Choose Package</Text>
              <div>
                <Button
                  onClick={() => {
                    setSelectedPackage(ExternalAppDataPackageType.STARTER)
                  }}
                >
                  Starter
                </Button>
                {/* <Button>Scale</Button> */}
              </div>
            </div>

            {selectedPackage && (
              <div>
                <div>
                  <Text>Reads:</Text>
                  <Text>{ExternalAppDataPackages[selectedPackage].reads}</Text>
                </div>
                <div>
                  <Text>Writes:</Text>
                  <Text>{ExternalAppDataPackages[selectedPackage].writes}</Text>
                </div>
              </div>
            )}
          </section>

          <footer>
            <Button onClick={onClose}>Close</Button>
            <Button type="submit">Change Subscription</Button>
          </footer>
        </subscriptionFetcher.Form>
      </Modal>
    </>
  )
}

export default AppDataStorageModal
