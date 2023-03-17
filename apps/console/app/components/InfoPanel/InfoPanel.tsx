import { InfoPanelIcon, InfoPanelIconProps } from './InfoPanelIcon'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

type InfoPanelProps = InfoPanelIconProps & {
  heading: string
  subheading: string

  className?: string

  links?: any[]
}

export const InfoPanel = ({
  className,
  Icon,
  heading,
  subheading,
  links,
}: InfoPanelProps) => (
  <article className={`bg-white p-6 ${className}`}>
    <section className="flex mb-1.5">
      <InfoPanelIcon Icon={Icon} />
    </section>

    <section className={links ? 'my-4' : 'mt-4'}>
      <Text size="lg" type="p" weight="medium" className="text-gray-900">
        {heading}
      </Text>
      <Text size="sm" type="p" weight="normal" className="text-gray-500">
        {subheading}
      </Text>
    </section>

    {links && (
      <section className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
        {links}
      </section>
    )}
  </article>
)
