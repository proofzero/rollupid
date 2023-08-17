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

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()

    const jwt = await requireJWT(request, context.env)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    try {
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

      return json({ clientId, success: true })
    } catch (error) {
      console.error({ error })
      return new InternalServerError({
        message: 'Could not create the application',
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
  onClick,
  setSelectedType,
}: {
  Icon: IconType
  header: string
  description: string
  selected?: boolean
  disabled?: boolean
  onClick: () => void
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
        onClick()
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
}: {
  setPage: (value: number) => void
  page: number
  setOrgType: (value: 'solo' | 'team') => void
}) => {
  const [selectedType, setSelectedType] = useState<'solo' | 'team'>('solo')

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
    transition-opacity ease-in-out delay-150 ${
      page === 0 ? 'opacity-100' : 'opacity-0 collapse'
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
        selected={selectedType === 'solo'}
        onClick={() => setOrgType('solo')}
        type="solo"
        setSelectedType={setSelectedType}
      />
      <Option
        Icon={TbUsers}
        header="I'm part of a team"
        description="I'm setting up app for a team"
        disabled={true}
        selected={selectedType === 'team'}
        onClick={() => setOrgType('team')}
        type="team"
        setSelectedType={setSelectedType}
      />
      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        onClick={() => setPage(page + 1)}
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
         page === 1 ? 'opacity-100' : 'opacity-0 collapse'
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
          label="First Name"
          id="firstName"
          className="w-full"
          onChange={(ev) => setFirstName(ev.target.value)}
        />
        <Input
          label="Last Name"
          id="lastName"
          className="w-full"
          onChange={(ev) => setLastName(ev.target.value)}
        />
      </div>
      {connectedEmails && connectedEmails.length === 0 && (
        <Button
          onClick={() =>
            redirectToPassport({
              PASSPORT_URL,
              login_hint: 'email microsoft google apple',
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
        disabled={
          !firstName?.length ||
          !lastName?.length ||
          fetcher.state !== 'idle' ||
          !email?.title
        }
        onClick={() => {
          fetcher.submit(
            {
              payload: JSON.stringify({
                name: `${lastName} ${firstName}`,
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
        {fetcher.state === 'idle' ? (
          <Text>Create Application</Text>
        ) : (
          <Spinner />
        )}
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
  setPage,
  page,
}: {
  setPage: (value: number) => void
  page: number
}) => {
  const [groupName, setGroupName] = useState('')
  const [groupSize, setGroupSize] = useState('2-10 members')
  const [groupRole, setGroupRole] = useState('Founder or leadership')

  return (
    <div
      className={`w-full h-full flex flex-col gap-2
      transition-opacity ease-in-out delay-150
      ${page === 2 ? 'opacity-100' : 'opacity-0 collapse'}`}
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
        id="firstName"
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
          !groupName?.length || !groupSize?.length || !groupRole?.length
        }
        onClick={() => {
          setPage(page + 1)
        }}
      >
        Create Group
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
    transition-opacity ease-in-out delay-150
    ${page === 2 ? 'opacity-100' : 'opacity-0 collapse'}`}
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
        id="firstName"
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
              { clientName, account: emailAccountURN },
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
      className={`w-full h-full flex flex-col gap-2
    transition-opacity ease-in-out delay-150
    ${page === 3 ? 'opacity-100' : 'opacity-0 collapse'}`}
    >
      <Text size="2xl" weight="medium">
        🎉 You are ready to go!
      </Text>
      <Text size="lg" className="text-gray-400 mb-2">
        Here is what you can do next
      </Text>
      <ul className="list-disc w-full flex flex-col gap-2">
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Lorem</Text>
            <DocumentationBadge
              url={'https://docs.rollup.id/platform/console/users'}
            />
          </div>
        </li>
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Ipsum</Text>
            <DocumentationBadge
              url={'https://docs.rollup.id/platform/console/blockchain'}
            />
          </div>
        </li>
        <li className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <Text>Lorem Ipsum</Text>
            <DocumentationBadge
              url={'https://docs.rollup.id/platform/console/kyc'}
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
  const { connectedEmails, PASSPORT_URL } = useOutletContext<{
    connectedEmails: DropdownSelectListItem[]
    PASSPORT_URL: string
  }>()

  const [page, setPage] = useState(0)
  const [clientId, setClientId] = useState('')
  const [emailAccountURN, setEmailAccountURN] = useState<AccountURN>()
  const [orgType, setOrgType] = useState<'solo' | 'team'>('solo')

  return (
    <div
      className="flex flex-col justify-start
     items-start gap-2 w-[50%] h-full"
    >
      <img src={consoleLogo} alt="console logo" className="w-[40%] mb-10" />
      <SelectOrgType setPage={setPage} page={page} setOrgType={setOrgType} />
      <ConnectEmail
        connectedEmails={connectedEmails}
        PASSPORT_URL={PASSPORT_URL}
        setPage={setPage}
        page={page}
        setEmailAccountURN={setEmailAccountURN}
      />
      {orgType === 'team' ? (
        <CreateGroup setPage={setPage} page={page} />
      ) : (
        <CreateApp
          setPage={setPage}
          page={page}
          setClientId={setClientId}
          emailAccountURN={emailAccountURN}
        />
      )}
      <CongratsPage
        navigateUrl={orgType === 'solo' ? `/apps/${clientId}` : `/dashboard`}
        page={page}
        navigateText={
          orgType === 'solo' ? 'Go to my Application' : 'Go to my Group'
        }
      />
    </div>
  )
}
