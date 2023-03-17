import React from 'react'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

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
    <Modal isOpen={isOpen} fixed handleClose={() => closeCallback()}>
      <div
        className={`w-[62vw] transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto flex items-start space-x-4`}
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
