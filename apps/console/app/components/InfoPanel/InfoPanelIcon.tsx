import { IconType } from 'react-icons'

export type InfoPanelIconProps = {
  Icon: IconType
}

export const InfoPanelIcon = ({ Icon }: InfoPanelIconProps) => (
  <span className="bg-indigo-50 p-3 rounded-lg">
    <Icon className="text-indigo-700 w-6 h-6" />
  </span>
)
