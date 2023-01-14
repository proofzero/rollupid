import React from 'react'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import SaveButton from './SaveButton'
import { Text } from '@kubelt/design-system'

import warn from '~/assets/warning.svg'

const UnsavedChangesModal = ({ isOpen, handleClose }) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="relative bg-white lg:w-[32rem] rounded-xl pb-3 pr-6">
        <div className="relative bg-white rounded-xl pl-6 pt-6">
          <div className="mb-[53px] flex flex-row items-start">
            <img src={warn} alt="warning" className="mr-4" />
            <div className="flex flex-col items-start">
              <Text size="lg" className="text-gray-900 mb-2">
                You have Unsaved Changes
              </Text>
              <Text size="sm" className="text-gray-500 text-left">
                You have made some changes. Do you want to discard or save them?
              </Text>
            </div>
          </div>
          <SaveButton
            size="l"
            isFormChanged={true}
            discardFn={() => {
              console.log('hey')
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default UnsavedChangesModal
