import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'

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
        <h3 className="text-xl font-bold mb-6">New Application</h3>

        <form method="post" action="/app/new">
          <p>Application Name</p>
          <input placeholder="My Application" name="client_name"></input>
          <button onClick={() => newAppCreateCallback(null)}>Cancel</button>
          <button type="submit">Create</button>
        </form>
      </>
    </Modal>
  )
}
