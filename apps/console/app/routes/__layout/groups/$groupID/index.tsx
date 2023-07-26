import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import {
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'
import { GroupRootContextData } from '../../groups'
import { useRef, useState } from 'react'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import _ from 'lodash'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'
import { Button, Text } from '@proofzero/design-system'
import classNames from 'classnames'
import { IconType } from 'react-icons'
import { TbApps, TbReceipt2, TbUserPlus } from 'react-icons/tb'
import { Pill } from '@proofzero/design-system/src/atoms/pills/Pill'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import { useHydrated } from 'remix-utils'
import {
  HiDotsVertical,
  HiOutlineClipboardCopy,
  HiOutlineTrash,
} from 'react-icons/hi'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { getProviderIcons } from '@proofzero/design-system/src/helpers'
import { Listbox, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import { InviteRes } from './invite'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'

const addressTypes = [
  ...Object.values(EmailAddressType),
  ...Object.values(OAuthAddressType),
  ...Object.values(CryptoAddressType),
]

type InvitationModel = {
  identifier: string
  addressType: EmailAddressType | OAuthAddressType | CryptoAddressType
  invitationURL: string
}

type LoaderData = {
  groupID: string
  URN: IdentityGroupURN
  invitations: InvitationModel[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupURN = `${['urn:rollupid:identity-group', params.groupID].join(
      '/'
    )}` as IdentityGroupURN
    if (!IdentityGroupURNSpace.is(groupURN)) {
      throw new Error('Invalid group ID')
    }

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const invitations =
      await coreClient.account.getIdentityGroupMemberInvitations.query({
        identityGroupURN: groupURN,
      })

    const mappedInvitations = invitations.map((invitation) => ({
      identifier: invitation.identifier,
      addressType: invitation.addressType,
      invitationURL: [context.env.CONSOLE_URL, invitation.invitationCode].join(
        '/'
      ),
    }))

    return json<LoaderData>({
      groupID: params.groupID as string,
      URN: groupURN,
      invitations: mappedInvitations,
    })
  }
)

export const ActionCard = ({
  Icon,
  title,
  subtitle,
  onClick,
}: {
  Icon: IconType
  title: string
  subtitle: string
  onClick?: () => void
}) => {
  return (
    <button
      className={classNames(
        'bg-white border rounded-lg shadow p-4 flex flex-row items-center gap-3.5',
        { 'hover:bg-gray-50': onClick }
      )}
      disabled={!onClick}
      onClick={onClick}
    >
      <div className="border rounded p-2.5 flex justify-center items-center">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>

      <div>
        <Text size="sm" weight="semibold" className="text-left">
          {title}
        </Text>
        <Text size="sm" weight="normal" className="text-gray-500 text-left">
          {subtitle}
        </Text>
      </div>
    </button>
  )
}

const InviteMemberModal = ({
  consoleURL,
  groupID,
  isOpen,
  handleClose,
}: {
  consoleURL: string
  groupID: string
  isOpen: boolean
  handleClose: () => void
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    EmailAddressType.Email
  )

  const inviteLinkFetcher = useFetcher<InviteRes>()
  const closeAndClearFetcher = () => {
    inviteLinkFetcher.submit(null, {
      action: '/api/reset-fetcher',
      method: 'post',
    })

    handleClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      handleClose={() => closeAndClearFetcher()}
      overflow="visible"
    >
      <div className="p-6">
        <section className="mb-4">
          <Text size="lg" weight="semibold" className="text-left">
            Add Group Member
          </Text>
          <Text size="sm" weight="normal" className="text-left text-gray-500">
            Each member has to be invited with unique link that expires in 24h
          </Text>
        </section>

        {!inviteLinkFetcher.data && (
          <inviteLinkFetcher.Form
            method="post"
            action={`/groups/${groupID}/invite`}
            className="flex flex-row gap-2"
          >
            <div className="grid grid-cols-5 relative">
              <Listbox
                value={selectedProvider}
                onChange={setSelectedProvider}
                name="addressType"
              >
                {({ open }) => (
                  <div className="flex flex-col col-span-2">
                    <Listbox.Button className="relative border rounded-l p-2 flex flex-row justify-between items-center flex-1 focus-visible:outline-none focus:border-indigo-500">
                      <div className="flex flex-row items-center gap-2">
                        <img
                          className="w-5 h-5"
                          src={getProviderIcons(selectedProvider)}
                        />
                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-800"
                        >
                          {_.upperFirst(selectedProvider)}
                        </Text>
                      </div>

                      {open ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronUpIcon className="w-5 h-5 text-gray-500 shrink-0" />
                      )}
                    </Listbox.Button>

                    <Transition
                      show={open}
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Listbox.Options
                        className="absolute bg-white p-2 flex flex-col gap-2 mt-1 focus-visible:ring-0 focus-visible:outline-none border shadow"
                        static
                      >
                        {addressTypes.map((provider) => (
                          <Listbox.Option
                            key={provider}
                            value={provider}
                            className={({ active }) =>
                              classNames(
                                'flex flex-row items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-lg cursor-pointer',
                                {
                                  'bg-gray-100': active,
                                }
                              )
                            }
                          >
                            {({ selected }) => (
                              <>
                                <img
                                  className="w-5 h-5"
                                  src={getProviderIcons(provider)}
                                />
                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-800"
                                >
                                  {_.upperFirst(provider)}
                                </Text>
                                {selected && (
                                  <CheckIcon
                                    className="h-5 w-5 text-indigo-600"
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                )}
              </Listbox>

              <input
                required
                type="text"
                name="identifier"
                className="border rounded-r border-gray-200 col-span-3 focus:ring-0 focus-visible:ring-0 focus:outline-none focus-visible:outline-none"
              />
            </div>

            <Button btnType="primary-alt" type="submit">
              Generate Invite Link
            </Button>
          </inviteLinkFetcher.Form>
        )}

        {inviteLinkFetcher.data && (
          <>
            <ReadOnlyInput
              id="inviteURL"
              label="Invite URL"
              value={[consoleURL, inviteLinkFetcher.data.inviteCode].join('/')}
              copyable
              onCopy={() =>
                toast(
                  ToastType.Success,
                  { message: 'Invite URL copied to clipboard!' },
                  {
                    duration: 2000,
                  }
                )
              }
              disabled
            />

            <Button
              className="w-full mt-4"
              btnType="primary-alt"
              type="button"
              onClick={() => {
                if (!navigator) {
                  console.warn('Copying is not available')

                  return
                }

                navigator.clipboard.writeText(
                  [consoleURL, inviteLinkFetcher.data!.inviteCode].join('/')
                )

                toast(
                  ToastType.Success,
                  { message: 'Invite URL copied to clipboard!' },
                  {
                    duration: 2000,
                  }
                )

                closeAndClearFetcher()
              }}
            >
              Copy & Close
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default () => {
  const { groups, CONSOLE_URL } = useOutletContext<GroupRootContextData>()
  const { URN, groupID, invitations } = useLoaderData<LoaderData>()

  const group = useRef(groups.find((group) => group.URN === URN))

  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const hydrated = useHydrated()

  return (
    <>
      <InviteMemberModal
        groupID={groupID}
        isOpen={inviteModalOpen}
        handleClose={() => setInviteModalOpen(false)}
        consoleURL={CONSOLE_URL}
      />

      {group.current && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/groups',
              },
              {
                label: group.current.name,
              },
            ]}
            LinkType={Link}
          />
        </section>
      )}

      <section className="flex flex-row items-center justify-between mb-5">
        <Text size="2xl" weight="semibold">
          {group.current?.name}
        </Text>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <ActionCard
          Icon={TbUserPlus}
          title="Add Group Member"
          subtitle="Invite Members to the Group"
          onClick={() => setInviteModalOpen(true)}
        />

        <ActionCard
          Icon={TbApps}
          title="Transfer Application"
          subtitle="Transfer Application to the Group"
        />

        <ActionCard
          Icon={TbReceipt2}
          title="Group Billing & Invoicing"
          subtitle="Manage Billing and Entitlements"
        />
      </section>

      {group.current && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Text size="lg" weight="semibold">
                Applications
              </Text>

              <Pill className="bg-gray-200 rounded-lg !pr-2">
                <Text size="xs" weight="medium" className="text-gray-800">
                  0
                </Text>
              </Pill>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-9 flex flex-col justify-center items-center">
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

              <Text size="base" weight="medium" className="text-gray-400 mt-4">
                No Applications
              </Text>

              <Button btnType="secondary-alt" disabled className="mt-6">
                Transfer Application
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Text size="lg" weight="semibold">
                Members
              </Text>

              <Pill className="bg-gray-200 rounded-lg !pr-2">
                <Text size="xs" weight="medium" className="text-gray-800">
                  {group.current.members.length}
                </Text>
              </Pill>
            </div>

            <div>
              <List
                items={group.current.members.map((m) => ({
                  key: m.URN,
                  val: m,
                }))}
                itemRenderer={(item) => (
                  <article className="w-full flex flex-row items-center truncate">
                    <img
                      src={item.val.iconURL}
                      className="w-8 h-8 rounded-full mr-6"
                    />

                    <div className="flex-1 truncate">
                      <div className="flex flex-row items-center gap-2">
                        <Text
                          size="sm"
                          weight="semibold"
                          className="text-gray-800"
                        >
                          {item.val.title}
                        </Text>

                        <Pill className="bg-indigo-50 rounded-lg !pr-2">
                          <Text
                            size="xs"
                            weight="semibold"
                            className="text-indigo-500 text-[10px]"
                          >
                            YOU
                          </Text>
                        </Pill>
                      </div>

                      <div className="flex flex-row items-center gap-1 text-gray-500 truncate">
                        {hydrated && (
                          <Text size="xs" weight="normal" className="shrink-0">
                            {new Date(item.val.joinTimestamp).toLocaleString(
                              'default',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </Text>
                        )}
                        <Text size="xs" weight="normal">
                          •
                        </Text>
                        <Text size="xs" weight="normal" className="truncate">
                          {item.val.address}
                        </Text>
                      </div>
                    </div>

                    <button
                      className="p-2"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <HiDotsVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </article>
                )}
              />

              <List
                items={invitations.map((i, idx) => ({
                  key: idx,
                  val: i,
                }))}
                itemRenderer={(item) => (
                  <article className="w-full flex flex-row items-center truncate">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex justify-center items-center mr-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_12945_40098)">
                          <path
                            d="M7.44531 6.55556C7.44531 7.49855 7.81991 8.40292 8.48671 9.06971C9.15351 9.73651 10.0579 10.1111 11.0009 10.1111C11.9439 10.1111 12.8482 9.73651 13.515 9.06971C14.1818 8.40292 14.5564 7.49855 14.5564 6.55556C14.5564 5.61256 14.1818 4.70819 13.515 4.0414C12.8482 3.3746 11.9439 3 11.0009 3C10.0579 3 9.15351 3.3746 8.48671 4.0414C7.81991 4.70819 7.44531 5.61256 7.44531 6.55556Z"
                            stroke="#6B7280"
                            strokeWidth="1.77778"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.66797 19.0003V17.2225C5.66797 16.2796 6.04257 15.3752 6.70937 14.7084C7.37616 14.0416 8.28053 13.667 9.22352 13.667H12.3346"
                            stroke="#6B7280"
                            strokeWidth="1.77778"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17.2227 19.8896V19.8996"
                            stroke="#6B7280"
                            strokeWidth="1.77778"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M17.224 17.2223C17.6224 17.2211 18.009 17.0861 18.3217 16.8392C18.6344 16.5922 18.8553 16.2475 18.9489 15.8601C19.0425 15.4728 19.0035 15.0653 18.838 14.7027C18.6726 14.3402 18.3903 14.0437 18.0364 13.8606C17.6828 13.6794 17.2783 13.6232 16.8887 13.7012C16.4991 13.7792 16.1473 13.9866 15.8906 14.2899"
                            stroke="#6B7280"
                            strokeWidth="1.77778"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_12945_40098">
                            <rect
                              width="21.3333"
                              height="21.3333"
                              fill="white"
                              transform="translate(0.333984 0.333008)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex-1 truncate">
                      <div className="flex flex-row items-center gap-2">
                        <Text
                          size="sm"
                          weight="semibold"
                          className="text-gray-800"
                        >
                          {item.val.identifier}
                        </Text>

                        <Pill className="bg-gray-100 rounded-lg !pr-2">
                          <Text
                            size="xs"
                            weight="semibold"
                            className="text-gray-500 text-[10px]"
                          >
                            Pending
                          </Text>
                        </Pill>
                      </div>

                      <div className="flex flex-row items-center gap-1 text-gray-500 truncate">
                        <Text size="xs" weight="normal" className="truncate">
                          {item.val.identifier}
                        </Text>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-4 p-2">
                      <button className="p-2" disabled>
                        <HiOutlineTrash className="w-4 h-4 text-gray-500" />
                      </button>

                      <Button
                        btnType="secondary-alt"
                        className="flex flex-row items-center gap-2"
                        btnSize="xs"
                        onClick={() => {
                          if (!navigator) {
                            console.warn('Copying is not available')

                            return
                          }

                          navigator.clipboard.writeText(item.val.invitationURL)

                          toast(
                            ToastType.Success,
                            { message: 'Invite URL copied to clipboard!' },
                            {
                              duration: 2000,
                            }
                          )
                        }}
                      >
                        <HiOutlineClipboardCopy className="w-4 h-4 text-gray-500" />

                        <span>Copy Link</span>
                      </Button>
                    </div>
                  </article>
                )}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
