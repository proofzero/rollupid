import { Button, Text } from '@proofzero/design-system'
import consoleLogo from '../../images/console_logo_black_text.svg'
import type { IconType } from 'react-icons'

import { TbUser, TbUsers, TbCheck } from 'react-icons/tb'

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

export default function Landing() {
  return (
    <div className="flex flex-col justify-start items-start gap-2 w-[50%] h-full">
      <img src={consoleLogo} alt="console logo" className="w-[40%] mb-10" />
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
        Contunue
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
