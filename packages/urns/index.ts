import { BaseURN, URNSpace, SpaceOptions } from 'urns'

export { parseURN } from 'urns'

export type CompType = Record<string, string>

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
export type RollupIdURN<NSS extends string = string> = BaseURN<'rollupid', NSS>
export type RollupIdURNSpace<
  NSS extends string = string,
  RComp extends CompType = CompType,
  QComp extends CompType = CompType
> = TypedComponentsURNSpace<'rollupid', NSS, RComp, QComp, RollupIdURN<NSS>>

// general
export const RollupIdSpace = new URNSpace('rollupid')

export const createRollupIdURNSpace = <
  NSSPrefix extends string = string,
  RComp extends CompType = CompType,
  QComp extends CompType = CompType
>(
  prefix?: string // optional if we want to validate prefix
): RollupIdURNSpace<`${NSSPrefix}/${string}`, RComp, QComp> => {
  return new TypedComponentsURNSpace<
    'rollupid',
    `${NSSPrefix}/${string}`,
    RComp,
    QComp,
    RollupIdURN<`${NSSPrefix}/${string}`>
  >('rollupid', {
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

class TypedComponentsURNSpace<
  NID extends string = string,
  NSS extends string = string,
  RCompType extends CompType = CompType,
  QCompType extends CompType = CompType,
  URNType extends BaseURN<NID, NSS> = BaseURN<NID, NSS>
> extends URNSpace<NID, NSS, string> {
  constructor(nid: NID, options?: Partial<SpaceOptions<NSS, string>>) {
    super(nid, options)
  }

  componentizedUrn(
    nss: string,
    rcomps?: RCompType,
    qcomps?: QCompType
  ): URNType {
    let result = super.urn(nss)

    if (rcomps) {
      const params = new URLSearchParams()
      Object.entries<string>(rcomps).forEach(([k, v]) => params.append(k, v))
      result += `?+${params.toString()}`
    }

    if (qcomps) {
      const params = new URLSearchParams()
      Object.entries<string>(qcomps).forEach(([k, v]) => params.append(k, v))
      result += `?=${params.toString()}`
    }

    return result as URNType
  }

  componentizedParse(
    urn: `urn:${NID}:${NSS}${string}`
  ): ParsedComponentizedURN<string, string, RCompType, QCompType> {
    const s = super.parse(urn)
    let rcomps = null
    if (s.rcomponent) {
      const params = new URLSearchParams(decodeURIComponent(s.rcomponent))

      rcomps = (Object.fromEntries(params.entries()) as RCompType) || null
    }
    let qcomps = null
    if (s.qcomponent) {
      const params = new URLSearchParams(s.qcomponent)
      qcomps = (Object.fromEntries(params.entries()) as QCompType) || null
    }

    const result = {
      nid: s.nid,
      nss: s.nss,
      nss_encoded: s.nss_encoded,
      decoded: s.nss_encoded,
      rcomponent: rcomps,
      qcomponent: qcomps,
      fragment: null,
    }

    return result
  }

  getBaseURN(urn: `urn:${NID}:${NSS}${string}`): URNType {
    const s = super.parse(urn)
    return `urn:${s.nid}:${s.nss}` as URNType
  }
}

interface ParsedComponentizedURN<
  NID extends string = string,
  NSS extends string = string,
  RCompType extends CompType = CompType,
  QCompType extends CompType = CompType
> {
  nid: NID
  nss: NSS
  nss_encoded: string
  decoded: string
  rcomponent: RCompType | null
  qcomponent: QCompType | null
  fragment: string | null
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
