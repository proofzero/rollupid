import { IconType } from "react-icons/lib";

export type SideMenuItemProps = {
  title: string;
  /**
   * Leaving screen null will only placehold the menu item
   */
  screen?: string;
  Icon: IconType;
};

export default function SideMenuItem({
  title,
  screen,
  Icon,
}: SideMenuItemProps) {
  const isActive = screen != null;
  return (
    <div className="flex-row items-center">
      <Icon className="inline-block w-[20px] h-[20px] mr-4" />
      <div className="inline-block leading-5 text-base">{title}</div>
    </div>
  );
}
