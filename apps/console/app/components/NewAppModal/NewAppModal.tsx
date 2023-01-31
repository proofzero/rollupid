import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Input } from '@kubelt/design-system/src/atoms/form/Input'
import { useState } from 'react'
import { RiLoader5Fill } from 'react-icons/ri'

export type NewAppModalProps = {
  isOpen: boolean
  newAppCreateCallback: (app: any) => void
}

export const NewAppModal = ({
  isOpen,
  newAppCreateCallback,
}: NewAppModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Modal
      isOpen={isOpen}
      fixed
      closable={!isSubmitting}
      handleClose={() => newAppCreateCallback(null)}
    >
      <div
        className={`relative w-[62vw] transform rounded-lg  bg-white px-4 pt-5 pb-4 
         text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
      >
        <Text size="lg" weight="semibold" className="text-gray-900 mb-8">
          Create Application
        </Text>

        <form
          method="post"
          action="/apps/new"
          onSubmit={() => setIsSubmitting(true)}
        >
          <Input
            id="client_name"
            label="Application Name"
            placeholder="My application"
            required
            className="mb-12"
          />

          <div className="flex justify-end items-center space-x-3">
            <Button
              btnType="secondary-alt"
              disabled={isSubmitting}
              onClick={() => newAppCreateCallback(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              btnType="primary-alt"
              className={
                isSubmitting
                  ? 'flex items-center justify-between transition'
                  : ''
              }
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <RiLoader5Fill className="animate-spin" size={22} />
              )}
              Create
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
