import { BaseURN, URNSpace, parseURN, SpaceOptions, FullURN } from 'urns'

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
export type CompType = { [k: string]: string }
export type ThreeIdURN<NSS extends string> = BaseURN<'threeid', NSS>
export type ThreeIdURNSpace<
  NSS extends string,
  RComp extends CompType,
  QComp extends CompType
> = TypedComponentsURNSpace<'threeid', NSS, RComp, QComp, ThreeIdURN<NSS>>

// general
export const ThreeIdSpace = new URNSpace('threeid')

export const createThreeIdURNSpace = <
  NSSPrefix extends string,
  RComp extends CompType,
  QComp extends CompType
>(
  prefix?: string // optional if we want to validate prefix
): ThreeIdURNSpace<`${NSSPrefix}/${string}`, RComp, QComp> => {
  return new TypedComponentsURNSpace<
    'threeid',
    `${NSSPrefix}/${string}`,
    RComp,
    QComp,
    ThreeIdURN<`${NSSPrefix}/${string}`>
  >('threeid', {
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
  NID extends string,
  NSS extends string,
  RCompType extends { [k: string]: string } = never,
  QCompType extends { [k: string]: string } = never,
  URNType extends BaseURN<NID, NSS> = never
> extends URNSpace<string, string, string> {
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
    urn: `urn:${string}:${string}${string}`
  ): ParsedComponentizedURN<string, string, RCompType, QCompType> {
    const s = super.parse(urn)
    console.debug('COMPONENTIZED PARSE', {
      urn,
      rcomps: s.rcomponent,
      qcomps: s.qcomponent,
      nid: s.nid,
      nss: s.nss,
      nss_encoded: s.nss_encoded,
      base_urn: this.getBaseURN(urn),
    })
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

  getBaseURN(urn: `urn:${string}:${string}${string}`): URNType {
    const s = super.parse(urn)
    return `urn:${s.nid}:${s.nss}` as URNType
  }
}

interface ParsedComponentizedURN<
  NID extends string,
  NSS extends string,
  RCompType extends { [k: string]: string },
  QCompType extends { [k: string]: string }
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
