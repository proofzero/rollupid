import React from 'react'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import SaveButton from './SaveButton'
import { Text } from '@proofzero/design-system'

import warn from '../../assets/warning.svg'
import { HiOutlineX } from 'react-icons/hi'

const UnsavedChangesModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean
  handleClose: (value: boolean) => void
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="relative rounded-lg bg-white lg:w-[32rem] pb-3 pr-6">
        <div className="relative bg-white pl-6">
          <div className="mb-[53px] flex flex-row items-start">
            <img src={warn} alt="warning" className="mr-4" />
            <div className="flex flex-col items-start">
              <div className="mb-2 flex flex-row items-center justify-between w-full">
                <Text size="lg" className="text-gray-900">
                  You have Unsaved Changes
                </Text>
                <button
                  className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
                  onClick={() => {
                    handleClose(false)
                  }}
                >
                  <HiOutlineX />
                </button>
              </div>
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
