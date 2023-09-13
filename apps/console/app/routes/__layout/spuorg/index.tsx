import { Form, useNavigate, useOutletContext } from '@remix-run/react'
import { GroupModel, type GroupRootContextData } from '../spuorg'
import { Button, Text } from '@proofzero/design-system'
import {
  HiDotsVertical,
  HiOutlineTrash,
  HiOutlineX,
  HiUserGroup,
} from 'react-icons/hi'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Fragment, useState, useRef } from 'react'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Menu, Transition } from '@headlessui/react'
import dangerVector from '~/images/danger.svg'

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
        <div className="flex flex-row w-full items-center justify-between mb-4">
          <Text size="lg" weight="semibold">
            Create Group
          </Text>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              handleClose()
            }}
          >
            <HiOutlineX />
          </div>
        </div>

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

const DeleteGroupModal = ({
  group,
  isOpen,
  handleClose,
}: {
  group: GroupModel
  isOpen: boolean
  handleClose: () => void
}) => {
  const [groupName, setGroupName] = useState('')

  const clearStateAndHandleClose = () => {
    setGroupName('')
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} handleClose={() => clearStateAndHandleClose()}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <Form
          method="post"
          action={`/spuorg/${group.URN.split('/')[1]}/delete`}
          className="flex-1"
          onSubmit={() => clearStateAndHandleClose()}
        >
          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Delete Application
            </Text>
            <button
              type="button"
              className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
              onClick={() => {
                handleClose()
              }}
              tabIndex={-1}
            >
              <HiOutlineX />
            </button>
          </div>

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Are you sure you want to delete <b>{group.name}</b> group? This
              action cannot be undone once confirmed.
            </Text>
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Confirm you want to delete this group by typing its name below.
            </Text>
            <Input
              id="group_name"
              label="Group Name"
              placeholder={group.name}
              required
              className="mb-12"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
            />
          </section>

          <div className="flex justify-end items-center space-x-3">
            <Button btnType="secondary-alt">Cancel</Button>
            <Button
              type="submit"
              btnType="dangerous"
              disabled={groupName !== group.name}
            >
              Delete
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

const GroupHasAppsModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean
  handleClose: () => void
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div
        className={`w-fit rounded-lg bg-white p-4 text-left transition-all sm:p-5 overflow-y-auto flex flex-col space-y-4`}
      >
        <section className="flex flex-row items-center justify-between w-full">
          <Text size="lg" weight="medium" className="text-gray-900">
            Delete Application
          </Text>
          <button
            type="button"
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              handleClose()
            }}
            tabIndex={-1}
          >
            <HiOutlineX />
          </button>
        </section>

        <section className="flex flex-row items-center space-x-4">
          <img src={dangerVector} alt="danger" />

          <Text size="sm">
            This group owns one or more apps. <br />
            Please delete those apps first if you want to remove the group.
          </Text>
        </section>

        <section className="flex justify-end">
          <Button btnType="primary-alt" onClick={handleClose}>
            OK
          </Button>
        </section>
      </div>
    </Modal>
  )
}

export default () => {
  const { groups, apps } = useOutletContext<GroupRootContextData>()
  const navigate = useNavigate()

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false)
  const [groupHasAppsModalOpen, setGroupHasAppsModalOpen] = useState(false)

  const [selectedGroup, setSelectedGroup] = useState<GroupModel>()

  const groupAppRefs = useRef(apps.filter((a) => Boolean(a.groupID)))

  return (
    <>
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        handleClose={() => setIsCreateGroupModalOpen(false)}
      />

      {selectedGroup && (
        <DeleteGroupModal
          isOpen={isDeleteGroupModalOpen}
          handleClose={() => setIsDeleteGroupModalOpen(false)}
          group={selectedGroup}
        />
      )}

      <GroupHasAppsModal
        isOpen={groupHasAppsModalOpen}
        handleClose={() => setGroupHasAppsModalOpen(false)}
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
                className="flex flex-row items-center justify-between w-full cursor-pointer"
              >
                <div
                  className="flex-1"
                  onClick={() => {
                    navigate(`/spuorg/${item.val.URN.split('/')[1]}`)
                  }}
                >
                  <Text size="base" weight="semibold" className="text-gray-800">
                    {item.val.name}
                  </Text>
                  {groupAppRefs.current.filter(
                    (ga) => ga.groupID === item.val.URN.split('/')[1]
                  ).length === 0 ? (
                    <Text size="sm" weight="normal" className="text-gray-500">
                      No applications
                    </Text>
                  ) : (
                    <Text size="sm" weight="normal" className="text-gray-500">
                      {
                        groupAppRefs.current.filter(
                          (ga) => ga.groupID === item.val.URN.split('/')[1]
                        ).length
                      }{' '}
                      applications
                    </Text>
                  )}
                </div>

                <div className="flex flex-row items-center gap-3">
                  <MultiAvatar
                    avatars={item.val.members.map((m) => m.iconURL)}
                    cutoff={3}
                    size={32}
                  />

                  <section className="p-1.5">
                    <Menu>
                      <Menu.Button>
                        <div
                          className="w-8 h-8 flex justify-center items-center cursor-pointer
          hover:bg-gray-100 hover:rounded-[6px]"
                        >
                          <HiDotsVertical className="text-lg text-gray-400" />
                        </div>
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items
                          className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100
          rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y
           divide-gray-100"
                        >
                          <div className="p-1 ">
                            <Menu.Item
                              as="div"
                              className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                  hover:rounded-[6px] hover:bg-gray-100"
                              onClick={() => {
                                if (groupAppRefs.current.length > 0) {
                                  setGroupHasAppsModalOpen(true)
                                } else {
                                  setSelectedGroup(item.val)
                                  setIsDeleteGroupModalOpen(true)
                                }
                              }}
                            >
                              <HiOutlineTrash className="text-xl font-normal text-red-500" />

                              <Text
                                size="sm"
                                weight="normal"
                                className="text-red-500"
                              >
                                Delete
                              </Text>
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </section>
                </div>
              </article>
            )}
          />
        </section>
      )}
    </>
  )
}
