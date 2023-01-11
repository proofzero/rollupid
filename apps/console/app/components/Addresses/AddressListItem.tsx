import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { PrimaryPill } from '@kubelt/design-system/src/atoms/pills/PrimaryPill'
import { IconPill } from '@kubelt/design-system/src/atoms/pills/IconPill'
import { HiOutlineEyeOff } from 'react-icons/hi'

type AddressListItemIconProps = {
  iconUrl: string
}
export const AddressListItemIcon = ({ iconUrl }: AddressListItemIconProps) => (
  <div className="rounded-full w-8 h-8 flex justify-center items-center bg-gray-200 overflow-hidden">
    <img src={iconUrl} className="object-cover" />
  </div>
)

export type AddressListItemProps = {
  id: string
  icon: string
  title: string
  wallet: string
  network: string
  chain: string
  address: string
  primary?: boolean
  hidden?: boolean
}
export const AddressListItem = ({
  id,
  icon,
  title,
  wallet,
  network,
  chain,
  address,
  primary = false,
  hidden = false,
}: AddressListItemProps) => (
  <article className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white p-4">
    <section className="mx-4">
      <AddressListItemIcon iconUrl={icon} />
    </section>

    <section className="flex-1 flex flex-col space-y-1.5">
      <div className="flex flex-row items-center space-x-2">
        <Text size="base" weight="semibold" className="text-gray-800">
          {title}
        </Text>

        {primary && <PrimaryPill text="Primary" />}

        {hidden && <IconPill Icon={HiOutlineEyeOff} />}
      </div>

      <div className="flex flex-row">
        <Text size="xs" weight="normal" className="text-gray-500">
          {wallet} • {network} {chain} • {address}
        </Text>
      </div>
    </section>
  </article>
)
