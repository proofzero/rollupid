import { BaseURN, URNSpace, parseURN } from 'urns'

export { parseURN }

// Object URN
export type ObjectURN = BaseURN<'durable-object', string>
export type ObjectURNSpace<NSS extends string> = URNSpace<
  'durable-object',
  NSS,
  string
>
// general
export const ObjectSpace = new URNSpace('durable-object')

export const createObjectURNSpace = (): ObjectURNSpace<string> => {
  return new URNSpace<'durable-object', string, string>('durable-object', {
    encode: (val: string): string => {
      // TODO: check format?
      return val
    },
    decode: (nss: string): string => {
      // TODO: check format?
      return nss
    },
  })
}

// PLATFORM URN
export type ThreeIdURN<NSS extends string> = BaseURN<'threeid', NSS>
export type ThreeIdURNSpace<NSS extends string> = URNSpace<
  'threeid',
  NSS,
  string
>

// general
export const ThreeIdSpace = new URNSpace('threeid')

export const createThreeIdURNSpace = <NSSPrefix extends string>(
  prefix?: string // optional if we want to validate prefix
): ThreeIdURNSpace<`${NSSPrefix}/${string}`> => {
  return new URNSpace<'threeid', `${NSSPrefix}/${string}`, string>('threeid', {
    encode: (val: string): string => {
      if (!prefix) throw 'cannot encode without prefix'
      return `${prefix}/${val}`
    },
    decode: (nss: string): string => {
      const [parent, val] = nss.split('/')
      if (prefix && parent != prefix) {
        throw 'unrecognized prefix: ${parent}'
      }
      return val
    },
  })
}

// Any URN
export type AnyURN = BaseURN<string, string>
export type AnyURNSpace<NID extends string, NSS extends string> = URNSpace<
  NID,
  NSS,
  string
>
// general

// TODO: should NSS Prefix just be a string?
export const createAnyURNSpace = (nid: string): AnyURNSpace<string, string> => {
  return new URNSpace<string, string, string>(nid, {
    encode: (val: string): string => {
      return val
    },
    decode: (nss: string): string => {
      return nss
    },
  })
}
