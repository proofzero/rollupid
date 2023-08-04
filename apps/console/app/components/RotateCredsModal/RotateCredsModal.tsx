import React from 'react'

import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import dangerVector from '../../images/danger.svg'
import { HiOutlineX } from 'react-icons/hi'

export type RotateCredsModalProps = {
  isOpen: boolean
  closeCallback: () => void
  rotateCallback: () => void
}

export const RotateCredsModal = ({
  isOpen,
  closeCallback,
  rotateCallback,
}: RotateCredsModalProps) => {
  return (
    <Modal isOpen={isOpen} handleClose={() => closeCallback()}>
      <div
        className={`w-[62vw] rounded-lg  bg-white p-4
         text-left transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <div className="flex-1">
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Roll Key
            </Text>
            <div
              className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
              onClick={() => {
                closeCallback()
              }}
            >
              <HiOutlineX />
            </div>
          </div>

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500">
              Are you sure you want to roll the key?
            </Text>
            <Text size="sm" weight="normal" className="text-gray-500">
              This action cannot be undone and your new key will only be
              presented once.
            </Text>
          </section>

          <div className="flex justify-end items-center space-x-3">
            <Button btnType="secondary-alt" onClick={() => closeCallback()}>
              Cancel
            </Button>
            <Button btnType="dangerous" onClick={() => rotateCallback()}>
              Roll
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
