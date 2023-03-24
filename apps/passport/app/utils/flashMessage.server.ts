export const FLASH_MESSAGE_KEY = 'FLASH_MESSAGE_KEY'

export const FLASH_MESSAGE = {
  DELETE: 'DELETE',
  SIGNOUT: 'SIGNOUT',
} as const

export const FLASH_MESSAGE_VALUES = {
  [FLASH_MESSAGE.DELETE]: 'Your Rollup Identity has been deleted.',
  [FLASH_MESSAGE.SIGNOUT]: "You've been signed out",
}
