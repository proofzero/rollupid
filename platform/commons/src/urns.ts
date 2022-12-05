import { BaseURN, URNSpace } from 'urns'

export type ThreeIdURN<NSS extends string> = BaseURN<'threeid', NSS>
export type ThreeIdURNSpace<NSS extends string> = URNSpace<'threeid', NSS, string>

export const createThreeIdURNSpace = <NSSPrefix extends string>(
  prefix: string
): ThreeIdURNSpace<`${NSSPrefix}/${string}`> => {
  return new URNSpace<'threeid', `${NSSPrefix}/${string}`, string>('threeid', {
    encode: (val: string): string => {
      return `${prefix}/${val}`
    },
    decode: (nss: string): string => {
      const [parent, val] = nss.split('/')
      if (parent != prefix) {
        throw 'unrecognized prefix: ${parent}'
      }
      return val
    },
  })
}
