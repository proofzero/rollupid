import { Button, Text } from '@proofzero/design-system'
import consoleLogo from '../../images/console_logo_black_text.svg'
import type { IconType } from 'react-icons'

import { TbUser, TbUsers, TbCheck } from 'react-icons/tb'
import { useState } from 'react'
import {
  Dropdown,
  type DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { useOutletContext, useSubmit } from '@remix-run/react'
import { getEmailIcon } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { redirectToPassport } from '~/utils'
import { HiOutlineArrowLeft, HiOutlineMail } from 'react-icons/hi'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { DocumentationBadge } from '~/components/DocumentationBadge'

const Option = ({
  Icon,
  header,
  description,
  selected = false,
}: {
  Icon: IconType
  header: string
  description: string
  selected?: boolean
}) => {
  return (
    <div
      className={`w-full flex p-4 flex-row items-center justify-start border rounded-lg gap-4
    ${selected ? 'border-indigo-500' : ''}`}
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

const FirstPage = () => {
  return (
    <>
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
        selected={true}
      />
      <Option
        Icon={TbUsers}
        header="I'm part of a team"
        description="I'm setting up app for a team"
      />
      <Button className="w-full" btnType="primary-alt" btnSize="xl">
        Continue
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </>
  )
}

const SecondPage = ({
  connectedEmails,
  PASSPORT_URL,
}: {
  connectedEmails: DropdownSelectListItem[]
  PASSPORT_URL: string
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const submit = useSubmit()

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft className="text-lg text-gray-400 cursor-pointer h-full w-full" />
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
                setEmail(selected.value)
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
          !firstName ||
          !lastName ||
          !email ||
          !firstName?.length ||
          !lastName?.length ||
          !email?.length
        }
      >
        Continue
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </>
  )
}

const ThirdPageGroup = () => {
  const [groupName, setGroupName] = useState('')
  const [groupSize, setGroupSize] = useState('')
  const [groupRole, setGroupRole] = useState('')

  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft className="text-lg text-gray-400 cursor-pointer h-full w-full" />
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
          !groupName ||
          !groupSize ||
          !groupRole ||
          !groupName?.length ||
          !groupSize?.length ||
          !groupRole?.length
        }
      >
        Create Group
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </>
  )
}

const ThirdPageIndividual = () => {
  const [appName, setAppName] = useState('')
  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <HiOutlineArrowLeft className="text-lg text-gray-400 cursor-pointer h-full w-full" />
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
        onChange={(ev) => setAppName(ev.target.value)}
      />

      <Button
        className="w-full"
        btnType="primary-alt"
        btnSize="xl"
        disabled={!appName || !appName?.length}
      >
        Continue
      </Button>
      <div className="mt-auto flex flex-row gap-2 w-full">
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2 border-indigo-500" />
        <div className="border w-full rounded-lg border-2" />
      </div>
    </>
  )
}

const FinalPage = () => {
  return (
    <>
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
      <Button className="w-full" btnType="primary-alt" btnSize="xl">
        Go to my Application
      </Button>
    </>
  )
}

export default function Landing() {
  const { connectedEmails, PASSPORT_URL } = useOutletContext<{
    connectedEmails: DropdownSelectListItem[]
    PASSPORT_URL: string
  }>()

  return (
    <div className="flex flex-col justify-start items-start gap-2 w-[50%] h-full">
      <img src={consoleLogo} alt="console logo" className="w-[40%] mb-10" />
      {/* <FirstPage /> */}
      {/* <SecondPage
        connectedEmails={connectedEmails}
        PASSPORT_URL={PASSPORT_URL}
      /> */}
      {/* <ThirdPageGroup /> */}
      {/* <ThirdPageIndividual /> */}
      <FinalPage />
    </div>
  )
}
