// Strings used so no other
// constructs need to be exported
export type ButtonSize = 'xs' | 'sm' | 'base' | 'l' | 'xl' | 'xxl'
export type ButtonType =
  | 'primary'
  | 'primary-alt'
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
    'bg-[#1f2937] text-white shadow-sm hover:bg-[#374151] focus:bg-[#1f2937] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  'primary-alt':
    'bg-[#3e29df] text-white shadow-sm hover:bg-[#6366f1] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  secondary:
    'bg-[#f3f4f6] text-[#5d4aec] shadow-sm border border-solid border-[#dfdcff] hover:bg-[#e5e7eb] focus:bg-[#f3f4f6] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  'secondary-alt':
    'bg-white text-[#1f2937] shadow-sm border border-solid border-[#d1d5db] hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  dangerous:
    'bg-red-500 text-white shadow-sm hover:bg-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  'dangerous-alt':
    'bg-white text-red-500 border border-solid border-red-500 shadow-sm hover:bg-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
}

export const disabledColorClasses = 'bg-[#f3f4f6] text-[#d1d5db]'
