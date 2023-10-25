import { Button, Text } from '@proofzero/design-system'
import consoleLogo from '~/images/console_logo_black_text.svg'
import type { IconType } from 'react-icons'

import { TbUser, TbUsers, TbCheck } from 'react-icons/tb'
import { useEffect, useState } from 'react'
import {
  Dropdown,
  type DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { useFetcher, useNavigate, useOutletContext } from '@remix-run/react'
import { getEmailIcon } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { redirectToPassport } from '~/utils'
import { HiOutlineArrowLeft, HiOutlineMail } from 'react-icons/hi'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { requireJWT } from '~/utilities/session.server'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { json, type ActionFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import type { AccountURN } from '@proofzero/urns/account'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()

    const jwt = await requireJWT(request, context.env)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const createApp = async (formData: FormData) => {
      const clientName = formData.get('clientName') as string
      const account = formData.get('account') as AccountURN

      if (!clientName?.length || !account?.length)
        throw new BadRequestError({
          message: 'App name and email address are required',
        })
      const { clientId } = await coreClient.starbase.createApp.mutate({
        clientName,
      })

      await coreClient.starbase.upsertAppContactAddress.mutate({
        account,
        clientId,
      })

      return {
        clientId,
        success: true,
      }
    }

    const createGroup = async (formData: FormData) => {
      const groupName = formData.get('groupName') as undefined | string

      if (!groupName?.length) {
        throw new BadRequestError({
          message: 'Group name is required',
        })
      }

      const { groupID } = await coreClient.identity.createIdentityGroup.mutate({
        name: groupName,
      })

      return {
        groupID,
        success: true,
      }
    }

    switch (formData.get('op')) {
      case 'createApp':
        try {
          const { clientId, success: createAppSuccess } = await createApp(
            formData
          )

          return json({ clientId, success: createAppSuccess })
        } catch (error) {
          return new InternalServerError({
            message: 'Could not create the application',
          })
        }
      case 'createGroup':
        try {
          const { groupID, success: createGroupSuccess } = await createGroup(
            formData
          )

          return json({ groupID, success: createGroupSuccess })
        } catch (error) {
          return new InternalServerError({
            message: 'Could not create the group',
          })
        }
      default:
        throw new BadRequestError({
          message: 'Invalid operation',
        })
    }
  }
)

const Option = ({
  type,
  Icon,
  header,
  description,
  selected = false,
  disabled = false,
  setSelectedType,
}: {
  Icon: IconType
  header: string
  description: string
  selected?: boolean
  disabled?: boolean
  setSelectedType: (value: 'solo' | 'team') => void
  type: 'solo' | 'team'
}) => {
  return (
    <div
      className={`w-full flex p-4 flex-row items-center justify-start border rounded-lg gap-4
    ${selected ? 'border-indigo-500' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (disabled) return
        setSelectedType(type)
      }}
    >
      <div className="p-2 border rounded-lg w-fit flex-none">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex flex-col flex-1">
        <Text weight="medium">{header}</Text>
        <Text size="sm" className="text-gray-400">
          {description}
        </Text>
      </div>
      {selected && (
        <div className="flex-none">
          <TbCheck className="w-8 h-8 text-indigo-500" />
        </div>
      )}
    </div>
  )
}

const SelectOrgType = ({
  setPage,
  page,
  setOrgType,
  orgType,
}: {
  setPage: (value: number) => void
  page: number
  setOrgType: (value: 'solo' | 'team') => void
  orgType: 'solo' | 'team'
}) => {
  return (
    <div
      className={`w-full h-full flex flex-col gap-2
    transition-opacity ease-in-out delay-150 ${
      page === 0 ? 'opacity-100' : 'hide'
    }`}
    >
      <Text size="lg" className="text-gray-400">
        1/4
      </Text>
      <Text size="2xl" weight="medium">
        Welcome to Rollup Console!
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        Are you solo developer or part of team?
      </Text>
      <Option
        Icon={TbUser}
        header="I'm solo developer"
        description="I'm setting up app for myself"
        selected={orgType === 'solo'}
        setSelectedType={() => setOrgType('solo')}
        type="solo"
      />
      <Option
        Icon={TbUsers}
        header="I'm part of a team"
        description="I'm setting up app for a team"
        selected={orgType === 'team'}
        type="team"
        setSelectedType={() => setOrgType('team')}
      />
      <Button
        className="w-full"
        btnType="primary-alt"
        disabled={!orgType?.length}
        btnSize="xl"
        onClick={() => {
          setPage(page + 1)
        }}
      >
        Continue
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </div>
  )
}

const ConnectEmail = ({
  connectedEmails,
  PASSPORT_URL,
  setPage,
  page,
  setEmailAccountURN,
}: {
  connectedEmails: DropdownSelectListItem[]
  PASSPORT_URL: string
  setPage: (value: number) => void
  page: number
  setEmailAccountURN: (value: AccountURN) => void
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState<DropdownSelectListItem | null>(null)

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setPage(page + 1)
    }
  }, [fetcher.state])

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
       transition-opacity ease-in-out delay-150 ${
         page === 1 ? 'opacity-100' : 'hide'
       }`}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft
          className="text-lg text-gray-400 cursor-pointer"
          onClick={() => setPage(page - 1)}
        />
        <Text size="lg" className="text-gray-400">
          2/4
        </Text>
      </div>
      <Text size="2xl" weight="medium">
        Contact Information
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        For organizational communication and billing
      </Text>
      <div className="flex flex-row items-center gap-2 w-full">
        <Input
          label="Full Name"
          id="name"
          className="w-full"
          onChange={(ev) => {
            setName(ev.target.value)
          }}
        />
      </div>
      {connectedEmails && connectedEmails.length === 0 && (
        <Button
          onClick={() =>
            redirectToPassport({
              PASSPORT_URL,
              login_hint: 'email microsoft google apple',
              rollup_action: 'connect',
            })
          }
          className="w-full"
          btnType="secondary-alt"
        >
          <div className="flex space-x-3">
            <HiOutlineMail className="w-5 h-5 text-gray-800" />
            <Text weight="medium" className="flex-1 text-gray-800">
              Connect Email Address
            </Text>
          </div>
        </Button>
      )}

      {connectedEmails && connectedEmails.length > 0 && (
        <div className="w-full">
          <Text size="sm" weight="medium" className="mb-0.5">
            Email Address
          </Text>

          <Dropdown
            items={connectedEmails.map((email: DropdownSelectListItem) => {
              // Substituting subtitle with icon
              // on the client side
              email.subtitle && !email.icon
                ? (email.icon = getEmailIcon(email.subtitle))
                : null
              return {
                value: email.value,
                selected: false,
                icon: email.icon,
                title: email.title,
              }
            })}
            placeholder="Select an Email Address"
            onSelect={(selected) => {
              // type casting to DropdownSelectListItem instead of array
              if (!Array.isArray(selected)) {
                if (!selected || !selected.value) {
                  console.error('Error selecting email, try again')
                  return
                }
                setEmail(selected)
                setEmailAccountURN(selected.value as AccountURN)
              }
            }}
            ConnectButtonCallback={() =>
              redirectToPassport({
                PASSPORT_URL,
                login_hint: 'email microsoft google apple',
                rollup_action: 'connect',
              })
            }
            ConnectButtonPhrase="Connect New Email Address"
          />
        </div>
      )}
      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        disabled={!name?.length || fetcher.state !== 'idle' || !email?.title}
        onClick={() => {
          fetcher.submit(
            {
              payload: JSON.stringify({
                name,
                email: email?.title,
                accountURN: email?.value,
              }),
              redirect: 'false',
            },
            {
              method: 'post',
              action: '/billing/details',
            }
          )
        }}
      >
        {fetcher.state === 'idle' ? <Text>Continue</Text> : <Spinner />}
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </div>
  )
}

const CreateGroup = ({
  setGroupID,
  setPage,
  page,
}: {
  setGroupID: (value: string) => void
  setPage: (value: number) => void
  page: number
}) => {
  const [groupName, setGroupName] = useState('')
  const [groupSize, setGroupSize] = useState('2-10 members')
  const [groupRole, setGroupRole] = useState('Founder or leadership')

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.groupID) {
      setGroupID(fetcher.data?.groupID)
      setPage(page + 1)
    }
  }, [fetcher.data, fetcher.state])

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
      transition-opacity  ease-in-out delay-150
      ${page === 2 ? 'opacity-100' : 'hide'}`}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft
          className="text-lg text-gray-400 cursor-pointer"
          onClick={() => setPage(page - 1)}
        />
        <Text size="lg" className="text-gray-400">
          3/4
        </Text>
      </div>
      <Text size="2xl" weight="medium">
        Set up your workspace
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        Tell us more about your workspace so we can provide you a personalized
        experience
      </Text>

      <Input
        label="Group Name"
        id="groupName"
        className="w-full"
        onChange={(ev) => setGroupName(ev.target.value)}
      />
      <div className="w-full">
        <Text size="sm" weight="medium" className="mb-0.5">
          Your Role
        </Text>

        <Dropdown
          items={[
            { title: 'Founder or leadership', value: 'Founder or leadership' },
            { title: 'Engineering manager', value: 'Product manager' },
            { title: 'Software developer', value: 'Software developer' },
            { title: 'Other', value: 'Other' },
            { title: 'Prefer not to share', value: 'Prefer not to share' },
          ]}
          placeholder="Set your role"
          defaultItems={[
            { title: 'Founder or leadership', value: 'Founder or leadership' },
          ]}
          onSelect={(selected) => {
            // type casting to DropdownSelectListItem instead of array
            if (!Array.isArray(selected)) {
              if (!selected || !selected.value) {
                console.error('Error selecting email, try again')
                return
              }
              setGroupRole(selected.value)
            }
          }}
        />
      </div>

      <div className="w-full">
        <Text size="sm" weight="medium" className="mb-0.5">
          Group Size
        </Text>

        <Dropdown
          items={[
            { title: '2-10 members', value: '2-10 members' },
            { title: '11-50 members', value: '11-50 members' },
            { title: '51-100 members', value: '51-100 members' },
            { title: '101-200 members', value: '101-200 members' },
            { title: 'Prefer not to share', value: 'Prefer not to share' },
          ]}
          placeholder="Set your group size"
          defaultItems={[{ title: '2-10 members', value: '2-10 members' }]}
          onSelect={(selected) => {
            // type casting to DropdownSelectListItem instead of array
            if (!Array.isArray(selected)) {
              if (!selected || !selected.value) {
                console.error('Error selecting email, try again')
                return
              }
              setGroupSize(selected.value)
            }
          }}
        />
      </div>

      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        disabled={
          !groupName?.length ||
          !groupSize?.length ||
          !groupRole?.length ||
          fetcher.state !== 'idle'
        }
        onClick={() => {
          fetcher.submit({ op: 'createGroup', groupName }, { method: 'post' })
        }}
      >
        {fetcher.state === 'idle' ? <Text>Create Group</Text> : <Spinner />}
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </div>
  )
}

const EnrollToGroup = ({
  groupName,
  setPage,
  page,
}: {
  groupName: string
  setPage: (value: number) => void
  page: number
}) => {
  const [groupRole, setGroupRole] = useState('Founder or leadership')

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
      transition-opacity  ease-in-out delay-150
      ${page === 2 ? 'opacity-100' : 'hide'}`}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft
          className="text-lg text-gray-400 cursor-pointer"
          onClick={() => setPage(page - 1)}
        />
        <Text size="lg" className="text-gray-400">
          3/4
        </Text>
      </div>
      <Text size="2xl" weight="medium">
        Workspace Details
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        Tell us more about your workspace so we can provide you a personalized
        experience
      </Text>

      <Input
        label="Group Name"
        id="groupName"
        className="w-full"
        disabled={true}
        readOnly={true}
        value={groupName}
        defaultValue={groupName}
      />
      <div className="w-full">
        <Text size="sm" weight="medium" className="mb-0.5">
          Your Role
        </Text>

        <Dropdown
          items={[
            { title: 'Founder or leadership', value: 'Founder or leadership' },
            { title: 'Engineering manager', value: 'Product manager' },
            { title: 'Software developer', value: 'Software developer' },
            { title: 'Other', value: 'Other' },
            { title: 'Prefer not to share', value: 'Prefer not to share' },
          ]}
          placeholder="Set your role"
          defaultItems={[
            { title: 'Founder or leadership', value: 'Founder or leadership' },
          ]}
          onSelect={(selected) => {
            // type casting to DropdownSelectListItem instead of array
            if (!Array.isArray(selected)) {
              if (!selected || !selected.value) {
                console.error('Error selecting email, try again')
                return
              }
              setGroupRole(selected.value)
            }
          }}
        />
      </div>

      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        disabled={!groupName?.length || !groupRole?.length}
        onClick={() => {
          setPage(page + 1)
        }}
      >
        <Text>Continue</Text>
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </div>
  )
}

const CreateApp = ({
  setPage,
  page,
  setClientId,
  emailAccountURN,
}: {
  setPage: (value: number) => void
  page: number
  setClientId: (value: string) => void
  emailAccountURN?: AccountURN
}) => {
  const [clientName, setClientName] = useState('')

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.clientId) {
      setClientId(fetcher.data?.clientId)
      setPage(page + 1)
    }
  }, [fetcher.data, fetcher.state])

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
    transition-opacity  ease-in-out delay-150
    ${page === 2 ? 'opacity-100' : 'hide'}`}
    >
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft
          className="text-lg text-gray-400 cursor-pointer"
          onClick={() => setPage(page - 1)}
        />
        <Text size="lg" className="text-gray-400">
          3/4
        </Text>
      </div>
      <Text size="2xl" weight="medium">
        Create first application
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        How would you like to name your first app?
      </Text>

      <Input
        label="Application Name"
        id="clientName"
        className="w-full"
        onChange={(ev) => setClientName(ev.target.value)}
      />

      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        disabled={
          !clientName ||
          !clientName?.length ||
          fetcher.state !== 'idle' ||
          !emailAccountURN?.length
        }
        onClick={() => {
          if (emailAccountURN) {
            fetcher.submit(
              { op: 'createApp', clientName, account: emailAccountURN },
              { method: 'post' }
            )
          }
        }}
      >
        {fetcher.state === 'idle' ? (
          <Text>Create Application</Text>
        ) : (
          <Spinner />
        )}
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </div>
  )
}

const CongratsPage = ({
  navigateUrl,
  page,
  navigateText,
}: {
  navigateUrl: string
  page: number
  navigateText: string
}) => {
  const navigate = useNavigate()

  return (
    <div
      className={`w-full h-full flex flex-col
    transition-opacity  ease-in-out delay-150
    ${page === 3 ? 'opacity-100' : 'hide'}`}
    >
      <Text size="2xl" weight="medium" className="mb-2">
        🎉 You are ready to go!
      </Text>
      <Text size="lg" className="text-gray-500 mb-4">
        Here is what you can do next
      </Text>
      <ul className="list-disc w-full flex flex-col text-gray-500 space-y-4 mb-8 pl-8">
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Configure your application</Text>
            <DocumentationBadge
              url={
                'https://docs.rollup.id/getting-started/create-an-application'
              }
            />
          </div>
        </li>
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Learn about OIDC / OAuth 2.0</Text>
            <DocumentationBadge
              url={
                'https://docs.rollup.id/an-introduction-to-openid-connect-oidc'
              }
            />
          </div>
        </li>
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Using Scopes</Text>
            <DocumentationBadge
              url={'https://docs.rollup.id/guides/using-scopes'}
            />
          </div>
        </li>
      </ul>
      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        onClick={() => {
          navigate(navigateUrl)
        }}
      >
        {navigateText}
      </Button>
    </div>
  )
}

export default function Landing() {
  const { connectedEmails, PASSPORT_URL, currentPage, targetIG } =
    useOutletContext<{
      connectedEmails: DropdownSelectListItem[]
      PASSPORT_URL: string
      currentPage: number
      targetIG:
        | undefined
        | {
            name: string
            URN: IdentityGroupURN
          }
    }>()

  // Currently 'team' is not an option. It is here for future use.
  const [orgType, setOrgType] = useState<'solo' | 'team'>(
    targetIG ? 'team' : 'solo'
  )
  const [clientId, setClientId] = useState('')
  const [emailAccountURN, setEmailAccountURN] = useState<AccountURN>()

  const [page, setPage] = useState(currentPage)
  const [groupID, setGroupID] = useState(
    targetIG ? targetIG.URN.split('/')[1] : ''
  )

  return (
    <div
      className="flex flex-col justify-start
     items-start gap-2 w-[50%] h-full"
    >
      <img src={consoleLogo} alt="console logo" className="w-[40%] mb-10" />
      <SelectOrgType
        setPage={setPage}
        page={page}
        setOrgType={setOrgType}
        orgType={orgType}
      />
      <ConnectEmail
        connectedEmails={connectedEmails}
        PASSPORT_URL={PASSPORT_URL}
        setPage={setPage}
        page={page}
        setEmailAccountURN={setEmailAccountURN}
      />
      {targetIG && (
        <EnrollToGroup
          groupName={targetIG.name}
          setPage={setPage}
          page={page}
        />
      )}

      {!targetIG && (
        <>
          {orgType === 'team' ? (
            <>
              {emailAccountURN && (
                <CreateGroup
                  setPage={setPage}
                  page={page}
                  setGroupID={setGroupID}
                />
              )}
            </>
          ) : (
            <CreateApp
              setPage={setPage}
              page={page}
              setClientId={setClientId}
              emailAccountURN={emailAccountURN}
            />
          )}
        </>
      )}

      <CongratsPage
        navigateUrl={
          orgType === 'solo' ? `/apps/${clientId}` : `/groups/${groupID}`
        }
        page={page}
        navigateText={
          orgType === 'solo' ? 'Go to my Application' : 'Go to my Group'
        }
      />
    </div>
  )
}
