import iIcon from '../../assets/i.svg'
import { Tooltip } from 'flowbite-react'

export default function Info({
  name,
  description,
  placement = 'bottom',
}: {
  name: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <Tooltip
      content={description}
      className="bg-white text-black shadow-xl absolute z-5 w-fit"
      placement={placement}
    >
      <img src={iIcon} alt={`${name} info`} />
    </Tooltip>
  )
}
