/**
 * @file app/shared/components/base-button/index.tsx
 */

// Utility
// -----------------------------------------------------------------------------

function getColorClasses(color: BaseButtonColor) {
  let colorClasses;
  switch (color) {
  case BaseButtonColor.LIGHT:
    colorClasses = "bg-kubelt-light text-kubelt-dark";
    break;
  case BaseButtonColor.DARK:
    colorClasses = "bg-kubelt-dark text-kubelt-light";
    break;
  }
  return colorClasses;
}

// Props
// -----------------------------------------------------------------------------

// TODO can we use the Tailwind dark mode support instead?
export enum BaseButtonColor {
  LIGHT,
  DARK,
};

type BaseButtonProps = {
  // The text to display on the button
  text: string;
  // The color "mode" (light, dark)
  color: BaseButtonColor,
  // Click handler
  onClick?: () => void;
  // Link target
  href?: string;
}

// BaseButtonAnchor
// -----------------------------------------------------------------------------

export function BaseButtonAnchor({ text, color, href }: BaseButtonProps) {
  const colorClasses = getColorClasses(color);
  return (
    <a className={colorClasses} href={href}>
      {text}
    </a>
  );
}

// Component
// -----------------------------------------------------------------------------

export default function BaseButton({ text, color, onClick }: BaseButtonProps) {
  const colorClasses = getColorClasses(color);
  return (
    <button className={`${colorClasses} text-base py-2 px-4 border`} onClick={onClick}>
      {text}
    </button>
  );
}
