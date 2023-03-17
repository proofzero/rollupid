import React, { useState } from 'react'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import dangerVector from '../../images/danger.svg'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { RiLoader5Fill } from 'react-icons/ri'

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
  const [isAppNameMatches, setAppNameMatches] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Modal
      isOpen={isOpen}
      fixed
      closable={!isSubmitting}
      handleClose={() => deleteAppCallback(false)}
    >
      <div
        className={`w-[62vw] transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} />

        <div className="flex-1">
          <Text size="lg" weight="medium" className="text-gray-900 mb-2">
            Delete Application
          </Text>

          <form
            method="post"
            action="/apps/delete"
            onSubmit={() => {
              setIsSubmitting(true)
            }}
          >
            <section className="mb-4">
              <Text size="sm" weight="normal" className="text-gray-500 my-3">
                Are you sure you want to delete <b>{appName}</b> app? This
                action cannot be undone once confirmed.
              </Text>
              <Text size="sm" weight="normal" className="text-gray-500 my-3">
                Confirm you want to delete this application by typing its name
                below.
              </Text>
              <Input
                id="client_name"
                label="Application Name"
                placeholder="My application"
                required
                className="mb-12"
                onChange={(e) => {
                  setAppNameMatches(appName === e?.target?.value)
                }}
              />
            </section>
            <input type="hidden" name="clientId" value={clientId} />

            <div className="flex justify-end items-center space-x-3">
              <Button
                btnType="secondary-alt"
                disabled={isSubmitting}
                onClick={() => deleteAppCallback(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!isAppNameMatches || isSubmitting}
                type="submit"
                btnType="dangerous"
                className={
                  isSubmitting
                    ? 'flex items-center justify-between transition'
                    : ''
                }
              >
                {isSubmitting && (
                  <RiLoader5Fill className="animate-spin" size={22} />
                )}
                Delete
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}
