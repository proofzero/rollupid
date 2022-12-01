import { BaseURN, URNSpace } from 'urns'

export type ThreeIdURN<NSS extends string> = BaseURN<'3id', NSS>
export type ThreeIdURNSpace<NSS extends string> = URNSpace<'3id', NSS, string>

export const createThreeIdURNSpace = <NSSPrefix extends string>(
  prefix: string
): ThreeIdURNSpace<`${NSSPrefix}/${string}`> => {
  return new URNSpace<'3id', `${NSSPrefix}/${string}`, string>('3id', {
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
