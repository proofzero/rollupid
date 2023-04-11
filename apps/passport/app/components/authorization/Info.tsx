import iIcon from '../../assets/i.svg'
import { Tooltip } from 'flowbite-react'

export default function Info({
  name,
  description,
}: {
  name: string
  description: string
}) {
  return (
    <Tooltip
      content={description}
      className="bg-white text-black shadow-xl absolute z-5"
      placement={name === 'Email' ? 'bottom' : 'right'}
      trigger="click"
    >
      <img src={iIcon} alt={`${name} info`} />
    </Tooltip>
  )
}
