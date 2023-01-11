import { Tooltip } from 'flowbite-react'

type ConditionalTooltipProps = {
  children: any
  condition: boolean
  content: string
  placement: string
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
      placement={placement}
      // without `text-black` text gets white on white bg
      // ¯\_(ツ)_/¯
      className="text-black"
      trigger={trigger}
    >
      {children}
    </Tooltip>
  ) : (
    children
  )
}

export default ConditionalTooltip
