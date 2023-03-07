import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { PreLabeledInput } from '@kubelt/design-system/src/atoms/form/PreLabledInput'
import { FeaturePill } from '@kubelt/design-system/src/atoms/pills/FeaturePill'
import { HiMail } from 'react-icons/hi'
import teamSVG from '~/assets/early/team.svg'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

const AppTeamPage = () => {
  return (
    <>
      <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
        Team & Contact
      </Text>

      <div className="bg-white p-10 rounded-lg shadow mb-6">
        <Text size="lg" weight="semibold" className="text-gray-900 mb-3">
          Contact Email
        </Text>

        <div className="flex mb-2.5">
          <PreLabeledInput
            id="email"
            label="Email"
            placeholder="john@doe.com"
            required
            preLabel={<HiMail />}
          />
        </div>

        <Text size="sm" weight="normal" className="text-gray-400">
          This will be used for notifications about your application
        </Text>
      </div>

      <div className="bg-white p-10 rounded-lg shadow mb-6 flex flex-row space-x-11">
        <img src={teamSVG} />

        <div className="flex-1">
          <div className="mb-7">
            <FeaturePill text="Early Access" />
          </div>

          <Text size="2xl" weight="semibold" className="mb-7">
            Manage roles & Permissions
          </Text>

          <div className="w-2/3 border-t border-gray-200 mb-7" />

          <Button btnType="primary-alt">Notify Me</Button>
        </div>
      </div>
    </>
  )
}

export default AppTeamPage
