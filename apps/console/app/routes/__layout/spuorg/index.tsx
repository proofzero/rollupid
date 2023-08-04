import { Form, useNavigate, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../spuorg'
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
          action="/spuorg/create"
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

      {groups.length === 0 && (
        <section className="bg-white border rounded-lg py-28 flex flex-col justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="92"
            height="92"
            viewBox="0 0 92 92"
            fill="none"
          >
            <path
              d="M46 91.667C71.4051 91.667 92 71.1466 92 45.8335C92 20.5203 71.4051 0 46 0C20.5949 0 0 20.5203 0 45.8335C0 71.1466 20.5949 91.667 46 91.667Z"
              fill="#F9FAFB"
            />
            <path
              d="M72.3758 30.5439H19.6292C17.9355 30.5439 16.5625 31.7402 16.5625 33.2159V89.3278C16.5625 90.8035 17.9355 91.9997 19.6292 91.9997H72.3758C74.0695 91.9997 75.4425 90.8035 75.4425 89.3278V33.2159C75.4425 31.7402 74.0695 30.5439 72.3758 30.5439Z"
              fill="white"
            />
            <path
              d="M39.8677 38.5605H23.9211C22.9049 38.5605 22.0811 39.2783 22.0811 40.1637C22.0811 41.0492 22.9049 41.7669 23.9211 41.7669H39.8677C40.8839 41.7669 41.7077 41.0492 41.7077 40.1637C41.7077 39.2783 40.8839 38.5605 39.8677 38.5605Z"
              fill="#F3F4F6"
            />
            <path
              d="M50.9077 45.5078H23.9211C22.9049 45.5078 22.0811 46.2256 22.0811 47.111C22.0811 47.9964 22.9049 48.7142 23.9211 48.7142H50.9077C51.9239 48.7142 52.7477 47.9964 52.7477 47.111C52.7477 46.2256 51.9239 45.5078 50.9077 45.5078Z"
              fill="#F9FAFB"
            />
            <path
              d="M39.8677 52.9912H23.9211C22.9049 52.9912 22.0811 53.709 22.0811 54.5944C22.0811 55.4798 22.9049 56.1976 23.9211 56.1976H39.8677C40.8839 56.1976 41.7077 55.4798 41.7077 54.5944C41.7077 53.709 40.8839 52.9912 39.8677 52.9912Z"
              fill="#F3F4F6"
            />
            <path
              d="M50.9077 59.9385H23.9211C22.9049 59.9385 22.0811 60.6563 22.0811 61.5417C22.0811 62.4271 22.9049 63.1449 23.9211 63.1449H50.9077C51.9239 63.1449 52.7477 62.4271 52.7477 61.5417C52.7477 60.6563 51.9239 59.9385 50.9077 59.9385Z"
              fill="#F9FAFB"
            />
            <path
              d="M39.8677 67.4189H23.9211C22.9049 67.4189 22.0811 68.1367 22.0811 69.0221C22.0811 69.9076 22.9049 70.6253 23.9211 70.6253H39.8677C40.8839 70.6253 41.7077 69.9076 41.7077 69.0221C41.7077 68.1367 40.8839 67.4189 39.8677 67.4189Z"
              fill="#F3F4F6"
            />
            <path
              d="M50.9077 74.3662H23.9211C22.9049 74.3662 22.0811 75.084 22.0811 75.9694C22.0811 76.8548 22.9049 77.5726 23.9211 77.5726H50.9077C51.9239 77.5726 52.7477 76.8548 52.7477 75.9694C52.7477 75.084 51.9239 74.3662 50.9077 74.3662Z"
              fill="#F9FAFB"
            />
            <path
              d="M72.3758 4.37109H19.6292C17.9355 4.37109 16.5625 5.56739 16.5625 7.04309V23.075C16.5625 24.5507 17.9355 25.747 19.6292 25.747H72.3758C74.0695 25.747 75.4425 24.5507 75.4425 23.075V7.04309C75.4425 5.56739 74.0695 4.37109 72.3758 4.37109Z"
              fill="#E5E7EB"
            />
            <path
              d="M39.8687 10.252H23.922C22.9058 10.252 22.082 10.9697 22.082 11.8551C22.082 12.7406 22.9058 13.4583 23.922 13.4583H39.8687C40.8849 13.4583 41.7087 12.7406 41.7087 11.8551C41.7087 10.9697 40.8849 10.252 39.8687 10.252Z"
              fill="white"
            />
            <path
              d="M50.9087 17.1992H23.922C22.9058 17.1992 22.082 17.917 22.082 18.8024C22.082 19.6878 22.9058 20.4056 23.922 20.4056H50.9087C51.9249 20.4056 52.7487 19.6878 52.7487 18.8024C52.7487 17.917 51.9249 17.1992 50.9087 17.1992Z"
              fill="white"
            />
          </svg>

          <Text className="text-gray-400 mt-4">
            You are not a member of any groups yet
          </Text>
        </section>
      )}

      {groups.length > 0 && (
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
              navigate(`/spuorg/${item.val.URN.split('/')[1]}`)
            }}
          ></List>
        </section>
      )}
    </>
  )
}
