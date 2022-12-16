import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Input } from '@kubelt/design-system/src/atoms/form/Input'

export type NewAppModalProps = {
  isOpen: boolean
  newAppCreateCallback: (app: any) => void
}

export const NewAppModal = ({
  isOpen,
  newAppCreateCallback,
}: NewAppModalProps) => {
  return (
    <Modal isOpen={isOpen} fixed handleClose={() => newAppCreateCallback(null)}>
      <>
        <Text size="lg" weight="semibold" className="text-gray-900 mb-8">
          Create Application
        </Text>

        <form method="post" action="/apps/new">
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
              onClick={() => newAppCreateCallback(null)}
            >
              Cancel
            </Button>
            <Button type="submit" btnType="primary-alt">
              Create
            </Button>
          </div>
        </form>
      </>
    </Modal>
  )
}
