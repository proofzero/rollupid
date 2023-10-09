import {
  Form,
  Link,
  NavLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { Fragment, useEffect, useState } from 'react'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import _ from 'lodash'
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
  HiOutlineX,
} from 'react-icons/hi'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { getProviderIcons } from '@proofzero/design-system/src/helpers'
import { Listbox, Menu, Transition } from '@headlessui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import { InviteRes } from './invite'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'
import { IdentityURN } from '@proofzero/urns/identity'
import dangerVector from '~/images/danger.svg'
import { ApplicationListItemPublishedState } from '~/components/Applications/ApplicationListItem'
import { ServicePlanType } from '@proofzero/types/billing'
import { GroupDetailsContextData } from '../$groupID'
import { PurchaseGroupSeatingModal } from '~/components/Billing/seating'
import {
  LoaderData,
  TxProduct,
  action as billingAction,
  loader as billingLoader,
} from '../../billing/ops'
import { process3DSecureCard } from '~/utils/billing'
import { useFeatureFlags } from '@proofzero/design-system/src/hooks/feature-flags'
import { IDENTITY_GROUP_OPTIONS } from '@proofzero/platform/identity/src/constants'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'

const accountTypes = [
  ...Object.values(EmailAccountType),
  ...Object.values(OAuthAccountType),
  ...Object.values(CryptoAccountType),
]

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
        'border rounded-lg shadow p-4 flex flex-row items-center gap-3.5',
        { 'hover:bg-gray-50 bg-white': onClick },
        { 'bg-gray-100': !onClick }
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
  passportURL,
  groupID,
  isOpen,
  handleClose,
}: {
  passportURL: string
  groupID: string
  isOpen: boolean
  handleClose: () => void
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>(
    EmailAccountType.Email
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
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div className="p-6">
        <section className="mb-4 w-full flex flex-row items-start justify-between">
          <div className="flex flex-col">
            <Text size="lg" weight="semibold" className="text-left">
              Add Group Member
            </Text>
            <Text size="sm" weight="normal" className="text-left text-gray-500">
              Each member has to be invited with unique link that expires in 24h
            </Text>
          </div>
          <div
            className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
            onClick={() => {
              handleClose()
            }}
          >
            <HiOutlineX />
          </div>
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
                name="accountType"
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
                        {accountTypes.map((provider) => (
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
              value={[
                passportURL,
                'groups',
                'enroll',
                groupID,
                inviteLinkFetcher.data.inviteCode,
              ].join('/')}
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
                  [
                    passportURL,
                    'groups',
                    'enroll',
                    groupID,
                    inviteLinkFetcher.data!.inviteCode,
                  ].join('/')
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

const RemoveMemberModal = ({
  identityURN,
  userAlias,
  groupID,
  isOpen,
  handleClose,
  purge,
}: {
  identityURN: IdentityURN
  userAlias: string
  groupID: string
  isOpen: boolean
  handleClose: () => void
  purge?: boolean
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <Form
          method="post"
          action={`/groups/${groupID}/kick`}
          onSubmit={() => {
            handleClose()
          }}
        >
          <input name="identityURN" type="hidden" value={identityURN} />
          {purge && <input name="purge" type="hidden" value="true" />}

          <div className="flex flex-row items-center justify-between w-full mb-2">
            <Text size="lg" weight="medium" className="text-gray-900">
              Remove Member
            </Text>
          </div>

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Are you sure you want to remove “{userAlias}” from the group?{' '}
              <br />
              This action will remove member's access to the group and all{' '}
              <br />
              applications within the group.
            </Text>
          </section>

          <div className="flex justify-end items-center space-x-3">
            <Button btnType="secondary-alt" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" btnType="dangerous">
              Remove Member
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

const RemoveInvitationModal = ({
  groupID,
  invitationCode,
  userAlias,
  isOpen,
  handleClose,
}: {
  groupID: string
  invitationCode: string
  userAlias: string
  isOpen: boolean
  handleClose: () => void
  purge?: boolean
}) => {
  return (
    <Modal isOpen={isOpen} handleClose={handleClose}>
      <div
        className={`w-fit rounded-lg bg-white p-4
         text-left  transition-all sm:p-5 overflow-y-auto flex items-start space-x-4`}
      >
        <img src={dangerVector} alt="danger" />

        <Form
          method="post"
          action={`/groups/${groupID}/uninvite`}
          onSubmit={() => {
            handleClose()
          }}
        >
          <input name="invitationCode" type="hidden" value={invitationCode} />

          <div className="flex flex-row w-full items-center justify-between mb-2">
            <Text size="lg" weight="semibold">
              Cancel Invitation
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

          <section className="mb-4">
            <Text size="sm" weight="normal" className="text-gray-500 my-3">
              Are you sure you want to cancel the invitation for {userAlias}?
            </Text>
          </section>

          <div className="flex justify-end items-center space-x-3">
            <Button btnType="secondary-alt" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" btnType="dangerous">
              Cancel invitation
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  )
}
export const loader = billingLoader
export const action = billingAction

export default () => {
  const {
    apps,
    group,
    groupID,
    groupURN,
    PASSPORT_URL,
    identityURN,
    invitations,
    paymentFailedIG,
  } = useOutletContext<GroupDetailsContextData>()

  const { STRIPE_PUBLISHABLE_KEY, toastNotification, paymentData, groupSeats } =
    useLoaderData<LoaderData>()
  const actionData = useActionData()

  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const hydrated = useHydrated()

  const [selectedMemberURN, setSelectedMemberURN] = useState<IdentityURN>()
  const [selectedInvitationCode, setSelectedInvitationCode] = useState<string>()
  const [selectedMemberAlias, setSelectedMemberAlias] = useState<string>('')
  const [removeMemberModalOpen, setRemoveMemberModalOpen] = useState(false)
  const [removeInvitationModalOpen, setRemoveInvitationModalOpen] =
    useState(false)

  const [purchaseGroupSeatingModalOpen, setPurchaseGroupSeatingModalOpen] =
    useState(false)

  const groupApps = apps.filter((a) => a.groupID === groupID)

  const navigate = useNavigate()
  const submit = useSubmit()

  const fetcher = useFetcher()
  useEffect(() => {
    // Checking status for 3DS payment authentication
    if (actionData?.status || fetcher.data?.status) {
      const { status, client_secret, payment_method, subId } = actionData
        ? actionData
        : fetcher.data

      process3DSecureCard({
        STRIPE_PUBLISHABLE_KEY,
        status,
        subId,
        client_secret,
        payment_method,
        submit,
        redirectUrl: `/groups/${groupID}`,
        URN: groupURN,
      })
    }
  }, [actionData, fetcher.data])

  useEffect(() => {
    if (toastNotification) {
      toast(toastNotification.type, {
        message: toastNotification.message,
      })
    }
  }, [toastNotification])

  const featureFlags = useFeatureFlags(hydrated)

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <InviteMemberModal
        groupID={groupID}
        isOpen={inviteModalOpen}
        handleClose={() => setInviteModalOpen(false)}
        passportURL={PASSPORT_URL}
      />

      {group && selectedMemberURN && (
        <RemoveMemberModal
          isOpen={removeMemberModalOpen}
          handleClose={() => setRemoveMemberModalOpen(false)}
          groupID={groupID}
          identityURN={selectedMemberURN}
          userAlias={selectedMemberAlias}
          purge={group.members.length === 1}
        />
      )}

      {group && selectedInvitationCode && (
        <RemoveInvitationModal
          isOpen={removeInvitationModalOpen}
          handleClose={() => setRemoveInvitationModalOpen(false)}
          groupID={groupID}
          invitationCode={selectedInvitationCode}
          userAlias={selectedMemberAlias}
        />
      )}
      <PurchaseGroupSeatingModal
        groupID={groupID}
        isOpen={purchaseGroupSeatingModalOpen}
        setIsOpen={setPurchaseGroupSeatingModalOpen}
        paymentData={paymentData}
        purchaseFn={(quantity) => {
          submit(
            {
              payload: JSON.stringify({
                quantity: groupSeats.total + quantity,
                customerID: paymentData?.customerID,
                txType: 'buy',
                txProduct: TxProduct.Seats,
              }),
            },
            {
              method: 'post',
            }
          )
        }}
      />

      {group && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/groups',
              },
              {
                label: group.name,
              },
            ]}
            LinkType={Link}
          />
        </section>
      )}

      <section className="flex flex-row items-center justify-between mb-5">
        <Text size="2xl" weight="semibold">
          {group?.name}
        </Text>
      </section>

      {paymentFailedIG.includes(groupURN) && (
        <section className="my-3">
          <ToastWithLink
            message="Payment for group user seats failed. Update group Payment Information to enable members' access"
            linkHref={
              paymentData?.customerID
                ? `/billing/payment?URN=${IdentityGroupURNSpace.urn(groupID)}`
                : `/billing/groups/${groupID}`
            }
            linkText="Update payment information"
            type="warning"
          />
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
        <ActionCard
          Icon={TbUserPlus}
          title="Add Group Member"
          subtitle="Invite Members to the Group"
          onClick={
            group.members.length + invitations.length <
            IDENTITY_GROUP_OPTIONS.maxFreeMembers + groupSeats.total
              ? () => setInviteModalOpen(true)
              : undefined
          }
        />

        <ActionCard
          Icon={TbApps}
          title="Create Application"
          subtitle="Create new app for this group"
          onClick={() => navigate(`/groups/${groupID}/apps/new`)}
        />

        <ActionCard
          Icon={TbReceipt2}
          title="Group Billing & Invoicing"
          subtitle="Manage Billing and Entitlements"
          onClick={() => navigate(`/billing/groups/${groupID}`)}
        />
      </section>

      {group && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Text size="lg" weight="semibold">
                Applications
              </Text>

              <Pill className="bg-gray-200 rounded-lg !pr-2">
                <Text size="xs" weight="medium" className="text-gray-800">
                  {groupApps.length}
                </Text>
              </Pill>
            </div>

            {groupApps.length === 0 && (
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

                <Text
                  size="base"
                  weight="medium"
                  className="text-gray-400 mt-4"
                >
                  No Applications
                </Text>

                <NavLink to={`/groups/${groupID}/apps/new`}>
                  <Button btnType="secondary-alt" className="mt-6">
                    Create an Application
                  </Button>
                </NavLink>
              </div>
            )}

            <section className="flex flex-col gap-3">
              {groupApps.map((app) => (
                <article className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white">
                  <section>
                    <div className="rounded-l w-16 h-[3.75rem] flex justify-center items-center bg-gray-200 overflow-hidden">
                      {!app.icon && (
                        <Text className="text-gray-500">
                          {app.name?.substring(0, 1)}
                        </Text>
                      )}
                      {app.icon && (
                        <img
                          src={app.icon}
                          alt="Not Found"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </section>

                  <section className="px-4 flex-1">
                    <div className="flex flex-row space-x-2 items-center">
                      <Text size="sm" weight="medium" className="text-gray-900">
                        <div
                          onClick={() => {
                            navigate(`/apps/${app.clientId}`)
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          {app.name}
                        </div>
                      </Text>
                      <ApplicationListItemPublishedState
                        published={app.published}
                      />
                      <Pill className="border rounded-3xl py-none">
                        <Text size="xs">{group.name}</Text>
                      </Pill>
                      {app.appPlan !== ServicePlanType.FREE ? (
                        <Pill className="border rounded-3xl py-none">
                          <Text size="xs">{app.appPlan}</Text>
                        </Pill>
                      ) : null}
                    </div>

                    {hydrated && app.createdTimestamp && (
                      <Text size="xs" weight="normal" className="shrink-0">
                        {new Date(app.createdTimestamp).toLocaleString(
                          'default',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </Text>
                    )}
                  </section>
                </article>
              ))}
            </section>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Text size="lg" weight="semibold">
                Members
              </Text>

              <Pill className="bg-gray-200 rounded-lg !pr-2">
                <Text size="xs" weight="medium" className="text-gray-800">
                  {group.members.length}/
                  {IDENTITY_GROUP_OPTIONS.maxFreeMembers + groupSeats.total}
                </Text>
              </Pill>
            </div>

            {featureFlags['seats'] && (
              <section className="flex flex-row justify-between items-center mb-4">
                <div className="flex flex-row items-center space-x-1">
                  <Text size="sm" className="text-gray-500">
                    Unassigned User Seats:
                  </Text>
                  <Pill className="bg-white flex flex-row items-center rounded-xl">
                    <div className="w-2 h-2 rounded-full mr-2 bg-blue-300"></div>
                    <Text size="xs" weight="medium" className="text-gray-700">
                      {`Free ${
                        IDENTITY_GROUP_OPTIONS.maxFreeMembers -
                        Math.min(
                          IDENTITY_GROUP_OPTIONS.maxFreeMembers,
                          group.members.length
                        )
                      }`}
                    </Text>
                  </Pill>

                  <Pill className="bg-white flex flex-row items-center rounded-xl">
                    <div
                      className={classNames('w-2 h-2 rounded-full mr-2', {
                        'bg-gray-600': !paymentFailedIG.includes(groupURN),
                        'bg-orange-400': paymentFailedIG.includes(groupURN),
                      })}
                    ></div>
                    <Text size="xs" weight="medium" className="text-gray-700">
                      {`Purchased ${groupSeats.total - groupSeats.used}`}
                    </Text>
                    {paymentFailedIG.includes(groupURN) && (
                      <img src={dangerVector} className="w-4 h-4 ml-2" />
                    )}
                  </Pill>
                </div>
                <div>
                  <Button
                    onClick={() => setPurchaseGroupSeatingModalOpen(true)}
                    btnType="secondary-alt"
                    btnSize="sm"
                  >
                    Add seats
                  </Button>
                </div>
              </section>
            )}

            <div>
              <List
                items={group.members.map((m, i) => ({
                  key: m.URN,
                  val: m,
                  colorCode:
                    i < IDENTITY_GROUP_OPTIONS.maxFreeMembers
                      ? '#93C5FD'
                      : paymentFailedIG.includes(groupURN)
                      ? '#FB923C'
                      : '#4B5563',
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

                        {identityURN === item.key && (
                          <Pill className="bg-indigo-50 rounded-lg !pr-2">
                            <Text
                              size="xs"
                              weight="semibold"
                              className="text-indigo-500 text-[10px]"
                            >
                              YOU
                            </Text>
                          </Pill>
                        )}
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
                          {item.val.account}
                        </Text>
                      </div>
                    </div>

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
                                  setSelectedMemberURN(item.val.URN)
                                  setSelectedMemberAlias(item.val.title)
                                  setRemoveMemberModalOpen(true)
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
                      <button className="p-2">
                        <HiOutlineTrash
                          className="w-4 h-4 text-gray-500"
                          onClick={() => {
                            setSelectedInvitationCode(
                              _.last(item.val.invitationURL.split('/'))
                            )
                            setSelectedMemberAlias(item.val.identifier)
                            setRemoveInvitationModalOpen(true)
                          }}
                        />
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
