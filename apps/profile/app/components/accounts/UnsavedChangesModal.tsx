import React from 'react'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import SaveButton from './SaveButton'
import { Text } from '@proofzero/design-system'

import warn from '../../assets/warning.svg'

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
          {/* Form where this button is used should have
          an absolute relative position
          div below has relative - this way this button sticks to
          bottom right

          This div with h-[4rem] prevents everything from overlapping with
          div with absolute position below  */}
          <div className="h-[4rem]" />
          <div className="absolute bottom-0 right-0">
            <SaveButton
              size="l"
              isFormChanged={true}
              discardFn={() => {
                console.log('hey')
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UnsavedChangesModal
