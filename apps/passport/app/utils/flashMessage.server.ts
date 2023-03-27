export const FLASH_MESSAGE_KEY = 'FLASH_MESSAGE_KEY'

export enum FLASH_MESSAGE {
  DELETE = 'DELETE',
  SIGNOUT = 'SIGNOUT',
}

export const FLASH_MESSAGE_VALUES = {
  [FLASH_MESSAGE.DELETE]: 'Your Rollup Identity has been deleted.',
  [FLASH_MESSAGE.SIGNOUT]: "You've been signed out",
}
