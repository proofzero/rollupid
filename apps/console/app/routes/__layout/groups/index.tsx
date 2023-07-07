import { Form, useNavigate, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../groups'
import { Button, Text } from '@proofzero/design-system'
import { HiDotsVertical, HiUserGroup } from 'react-icons/hi'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { useState } from 'react'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'

const CreateGroupModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean
  handleClose: () => void
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="p-6">
        <Text size="lg" weight="semibold" className="mb-4 text-left">
          Create Group
        </Text>

        <Form
          method="post"
          action="/groups/create"
          className="flex flex-col gap-4"
          onSubmit={handleClose}
        >
          <Input
            id="name"
            label="Group Name"
            required
            placeholder="My Group"
            className="min-w-[464px]"
          />

          <section className="flex flex-row items-center justify-end gap-3">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" btnType="primary-alt">
              Create Group
            </Button>
          </section>
        </Form>
      </div>
    </Modal>
  )
}

export default () => {
  const { groups } = useOutletContext<GroupRootContextData>()
  const navigate = useNavigate()

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)

  return (
    <>
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        handleClose={() => setIsCreateGroupModalOpen(false)}
      />

      <section className="flex flex-row items-center justify-between mb-5">
        <Text size="2xl" weight="semibold">
          Groups
        </Text>

        <Button
          btnType="primary-alt"
          className="flex flex-row items-center gap-2"
          onClick={() => setIsCreateGroupModalOpen(true)}
        >
          <HiUserGroup />
          Create Group
        </Button>
      </section>

      <section>
        <List
          items={groups.map((g) => ({
            key: g.URN,
            val: g,
          }))}
          itemRenderer={(item) => (
            <article
              key={item.key}
              className="flex flex-row items-center justify-between w-full"
            >
              <div>
                <Text size="base" weight="semibold" className="text-gray-800">
                  {item.val.name}
                </Text>
                <Text size="sm" weight="normal" className="text-gray-500">
                  No applications
                </Text>
              </div>

              <div className="flex flex-row items-center gap-3">
                <MultiAvatar
                  avatars={item.val.members.map((m) => m.iconURL)}
                  cutoff={3}
                  size={32}
                />

                <button
                  className="p-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <HiDotsVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </article>
          )}
          onItemClick={(item) => {
            navigate(`/groups/${item.val.URN.split('/')[1]}`)
          }}
        ></List>
      </section>
    </>
  )
}
