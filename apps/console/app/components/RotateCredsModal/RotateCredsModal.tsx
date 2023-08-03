import React from 'react'

import { Button, Text } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import dangerVector from '../../images/danger.svg'

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
        className={`w-[62vw] rounded-lg  bg-white px-4 pb-4
         text-left transition-all sm:px-6 sm:pb-6 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="text-gray-900 mb-2">
            Roll Key
          </Text>

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
