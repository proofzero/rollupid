// Strings used so no other
// constructs need to be exported
export type ButtonSize = 'xs' | 'sm' | 'base' | 'l' | 'xl' | 'xxl'
export type ButtonType =
  | 'primary'
  | 'primary-alt'
  | 'primary-alt-skin'
  | 'secondary'
  | 'secondary-alt'
  | 'dangerous'
  | 'dangerous-alt'

// Dictionary pattern used
// so Tailwind can find the needed classes
export const sizeToSizesDict = {
  xs: 'min-w-[4rem] py-[7px] px-[11px] font-medium text-xs rounded',
  sm: 'min-w-[5rem] py-[9px] px-[13px] font-medium text-sm rounded-md',
  base: 'min-w-[6rem] py-[9px] px-[17px] font-medium text-sm rounded-md',
  l: 'min-w-[7rem] py-[9px] px-[17px] font-medium text-base rounded-md',
  xl: 'min-w-[8rem] py-[13px] px-[25px] font-medium text-base rounded-md',
  xxl: 'min-w-[20rem] py-[13px] px-[25px] font-medium text-base rounded-md',
}

export const typeToColorsDict = {
  primary:
    'bg-[#1f2937] text-white shadow-sm hover:bg-[#374151] focus:bg-[#1f2937] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary',
  'primary-alt':
    'bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary dark:border-gray-700 border',
  'primary-alt-skin':
    'bg-skin-primary text-skin-text shadow-sm hover:shadow hover:border hover:shadow-skin-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary dark:border-gray-700 border',
  secondary:
    'bg-[#f3f4f6] text-[#5d4aec] shadow-sm border border-solid border-[#dfdcff] hover:bg-[#e5e7eb] focus:bg-[#f3f4f6] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary',
  'secondary-alt':
    'bg-white text-[#1f2937] shadow-sm border border-solid border-[#d1d5db] hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary dark:bg-[#374151] dark:border-gray-600 dark:text-white',
  dangerous:
    'bg-red-500 text-white shadow-sm hover:bg-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary',
  'dangerous-alt':
    'bg-white text-red-500 border border-solid border-red-500 shadow-sm hover:bg-red-50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1F2937] focus:ring-skin-primary',
}

export const disabledColorClasses =
  'bg-[#f3f4f6] text-[#d1d5db] dark:text-gray-600 dark:bg-gray-800 dark:border-gray-700 border'
