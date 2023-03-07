import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { FeaturePill } from '@kubelt/design-system/src/atoms/pills/FeaturePill'

import designerSVG from '~/assets/early/designer.svg'

const AppDesignerPage = () => {
  return (
    <>
      <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
        Designer
      </Text>

      <div className="bg-white p-10 rounded-lg shadow flex flex-col lg:flex-row space-y-4 lg:space-y-0">
        <section className="lg:w-2/3">
          <div className="mb-4">
            <FeaturePill text="Early Access" />
          </div>

          <Text size="2xl" weight="semibold" className="text-gray-900">
            Customise your login experience
          </Text>

          <Text weight="normal" className="text-gray-500">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec
            ipsum massa, ullamcorper in, auctor et, scelerisque sed, est. Aenean
            vel massa quis mauris vehicula lacinia. Ut tempus purus at lorem.
            Suspendisse sagittis ultrices augue. Cras elementum. Etiam bibendum
            elit eget erat.
          </Text>
        </section>

        <section>
          <img src={designerSVG} />
        </section>
      </div>
    </>
  )
}

export default AppDesignerPage
