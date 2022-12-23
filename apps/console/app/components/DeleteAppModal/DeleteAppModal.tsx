import React from 'react'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import dangerVector from '~/images/danger.svg'

export type DeleteAppModalProps = {
  clientId: string
  appName: string
  isOpen: boolean
  deleteAppCallback: (app: any) => void
}

export const DeleteAppModal = ({
  clientId,
  appName,
  isOpen,
  deleteAppCallback,
}: DeleteAppModalProps) => {
  return (
    <Modal isOpen={isOpen} fixed handleClose={() => deleteAppCallback(false)}>
      <div
        className={`w-[62vw] transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="text-gray-900 mb-2">
            Delete Application
          </Text>

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500">
              Are you sure you want to delete <b>{appName}</b> app?
            </Text>
            <Text size="sm" weight="normal" className="text-gray-500">
              This action cannot be undone
            </Text>
          </section>

          <form method="post" action="/apps/delete">
            <input type="hidden" name="clientId" value={clientId} />

            <div className="flex justify-end items-center space-x-3">
              <Button
                btnType="secondary-alt"
                onClick={() => deleteAppCallback(false)}
              >
                Cancel
              </Button>
              <Button type="submit" btnType="dangerous">
                Delete
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
