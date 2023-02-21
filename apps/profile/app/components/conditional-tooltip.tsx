import { Tooltip } from 'flowbite-react'

type ConditionalTooltipProps = {
  children: any
  condition: boolean
  content: string
  trigger?: 'hover' | 'click'
}

const ConditionalTooltip = ({
  condition,
  content,
  placement = 'top',
  children,
  trigger = 'hover',
}: ConditionalTooltipProps) => {
  return condition ? (
    <Tooltip
      content={content}
      // placement=
      // without `text-black` text gets white on white bg
      // ¯\_(ツ)_/¯
      className="text-black bg-white font-[Inter]"
      trigger={trigger}
    >
      {children}
    </Tooltip>
  ) : (
    children
  )
}

export default ConditionalTooltip
