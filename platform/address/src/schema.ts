import { z } from 'zod'
import { Challenge, ContractAddressType, CryptoAddressProfile, CryptoAddressType, GetAddressProfileResult, GetLinkedProfileResult, GetNonceInput, GetNonceResult, GetOAuthDataResult, GithubProfile, GoogleProfile, HandleAddressType, InitVaultResult, LinkProfileInput, MicrosoftProfile, NodeType, OAuthAddressType, OAuthData, OAuthExtraParams, OAuthProfileJson, ResolveProfileResult, SetOAuthDataInput, TwitterProfile, VerifyNonceInput, VerifyNonceResult } from '../../packages/types/*.ts'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function AddressProfileSchema() {
  return z.union([CryptoAddressProfileSchema(), GithubProfileSchema(), GoogleProfileSchema(), MicrosoftProfileSchema(), TwitterProfileSchema()])
}

export function AddressTypeSchema() {
  return z.union([ContractAddressTypeSchema(), CryptoAddressTypeSchema(), HandleAddressTypeSchema(), OAuthAddressTypeSchema()])
}

export function ChallengeSchema(): z.ZodObject<Properties<Challenge>> {
  return z.object<Properties<Challenge>>({
    __typename: z.literal('Challenge').optional(),
    address: z.string(),
    redirectUri: z.string(),
    scope: z.string(),
    state: z.string(),
    template: z.string(),
    timestamp: z.string()
  })
}

export const ContractAddressTypeSchema = z.nativeEnum(ContractAddressType);

export function CryptoAddressProfileSchema(): z.ZodObject<Properties<CryptoAddressProfile>> {
  return z.object<Properties<CryptoAddressProfile>>({
    __typename: z.literal('CryptoAddressProfile').optional(),
    address: z.string(),
    avatar: z.string().nullish(),
    diplayName: z.string().nullish()
  })
}

export const CryptoAddressTypeSchema = z.nativeEnum(CryptoAddressType);

export function GetAddressProfileResultSchema(): z.ZodObject<Properties<GetAddressProfileResult>> {
  return z.object<Properties<GetAddressProfileResult>>({
    profile: AddressProfileSchema()
  })
}

export function GetLinkedProfileResultSchema(): z.ZodObject<Properties<GetLinkedProfileResult>> {
  return z.object<Properties<GetLinkedProfileResult>>({
    profile: definedNonNullAnySchema.nullish()
  })
}

export function GetNonceInputSchema(): z.ZodObject<Properties<GetNonceInput>> {
  return z.object<Properties<GetNonceInput>>({
    address: z.string(),
    redirectUri: z.string(),
    scope: z.string(),
    state: z.string(),
    template: z.string()
  })
}

export function GetNonceResultSchema(): z.ZodObject<Properties<GetNonceResult>> {
  return z.object<Properties<GetNonceResult>>({
    __typename: z.literal('GetNonceResult').optional(),
    nonce: z.string()
  })
}

export function GetOAuthDataResultSchema(): z.ZodObject<Properties<GetOAuthDataResult>> {
  return z.object<Properties<GetOAuthDataResult>>({
    __typename: z.literal('GetOAuthDataResult').optional(),
    data: OAuthDataSchema().nullish()
  })
}

export function GithubProfileSchema(): z.ZodObject<Properties<GithubProfile>> {
  return z.object<Properties<GithubProfile>>({
    __typename: z.literal('GithubProfile').optional(),
    avatar_url: z.string(),
    bio: z.string().nullish(),
    blog: z.string().nullish(),
    company: z.string().nullish(),
    created_at: z.string(),
    email: z.string().nullish(),
    events_url: z.string(),
    followers: z.number(),
    followers_url: z.string(),
    following: z.number(),
    following_url: z.string(),
    gists_url: z.string(),
    gravatar_id: z.string().nullish(),
    hireable: z.boolean().nullish(),
    html_url: z.string(),
    id: z.number(),
    location: z.string().nullish(),
    login: z.string(),
    name: z.string().nullish(),
    node_id: z.string(),
    organizations_url: z.string(),
    public_gists: z.number(),
    public_repos: z.number(),
    received_events_url: z.string(),
    repos_url: z.string(),
    site_admin: z.boolean(),
    starred_url: z.string(),
    subscriptions_url: z.string(),
    twitter_username: z.string().nullish(),
    type: z.string(),
    updated_at: z.string(),
    url: z.string()
  })
}

export function GoogleProfileSchema(): z.ZodObject<Properties<GoogleProfile>> {
  return z.object<Properties<GoogleProfile>>({
    __typename: z.literal('GoogleProfile').optional(),
    email: z.string().nullish(),
    email_verified: z.boolean().nullish(),
    family_name: z.string().nullish(),
    given_name: z.string().nullish(),
    locale: z.string().nullish(),
    name: z.string().nullish(),
    picture: z.string().nullish(),
    sub: z.string()
  })
}

export const HandleAddressTypeSchema = z.nativeEnum(HandleAddressType);

export function InitVaultResultSchema(): z.ZodObject<Properties<InitVaultResult>> {
  return z.object<Properties<InitVaultResult>>({
    __typename: z.literal('InitVaultResult').optional(),
    vaultURN: definedNonNullAnySchema
  })
}

export function LinkProfileInputSchema(): z.ZodObject<Properties<LinkProfileInput>> {
  return z.object<Properties<LinkProfileInput>>({
    profile: definedNonNullAnySchema
  })
}

export function MicrosoftProfileSchema(): z.ZodObject<Properties<MicrosoftProfile>> {
  return z.object<Properties<MicrosoftProfile>>({
    __typename: z.literal('MicrosoftProfile').optional(),
    email: z.string().nullish(),
    family_name: z.string().nullish(),
    given_name: z.string().nullish(),
    name: z.string().nullish(),
    picture: z.string().nullish(),
    sub: z.string()
  })
}

export const NodeTypeSchema = z.nativeEnum(NodeType);

export const OAuthAddressTypeSchema = z.nativeEnum(OAuthAddressType);

export function OAuthDataSchema(): z.ZodObject<Properties<OAuthData>> {
  return z.object<Properties<OAuthData>>({
    __typename: z.literal('OAuthData').optional(),
    accessToken: z.string(),
    accessTokenSecret: z.string().nullish(),
    extraParams: OAuthExtraParamsSchema().nullish(),
    profile: OAuthProfileSchema().nullish(),
    refreshToken: z.string().nullish()
  })
}

export function OAuthExtraParamsSchema(): z.ZodObject<Properties<OAuthExtraParams>> {
  return z.object<Properties<OAuthExtraParams>>({
    __typename: z.literal('OAuthExtraParams').optional(),
    expires_in: z.number().nullish(),
    id_token: z.string().nullish(),
    scope: z.string().nullish(),
    token_type: z.string().nullish()
  })
}

export function OAuthProfileSchema() {
  return z.union([OAuthProfileJsonSchema(), TwitterProfileSchema()])
}

export function OAuthProfileJsonSchema(): z.ZodObject<Properties<OAuthProfileJson>> {
  return z.object<Properties<OAuthProfileJson>>({
    __typename: z.literal('OAuthProfileJson').optional(),
    _json: AddressProfileSchema(),
    provider: z.string()
  })
}

export function ResolveProfileResultSchema(): z.ZodObject<Properties<ResolveProfileResult>> {
  return z.object<Properties<ResolveProfileResult>>({
    __typename: z.literal('ResolveProfileResult').optional(),
    profileURN: definedNonNullAnySchema.nullish()
  })
}

export function SetOAuthDataInputSchema(): z.ZodObject<Properties<SetOAuthDataInput>> {
  return z.object<Properties<SetOAuthDataInput>>({
    data: OAuthDataSchema()
  })
}

export function TwitterProfileSchema(): z.ZodObject<Properties<TwitterProfile>> {
  return z.object<Properties<TwitterProfile>>({
    __typename: z.literal('TwitterProfile').optional(),
    id: z.number(),
    name: z.string(),
    profile_image_url: z.string(),
    screen_name: z.string()
  })
}

export function VerifyNonceInputSchema(): z.ZodObject<Properties<VerifyNonceInput>> {
  return z.object<Properties<VerifyNonceInput>>({
    nonce: z.string(),
    signature: z.string()
  })
}

export function VerifyNonceResultSchema(): z.ZodObject<Properties<VerifyNonceResult>> {
  return z.object<Properties<VerifyNonceResult>>({
    __typename: z.literal('VerifyNonceResult').optional(),
    code: z.string(),
    state: z.string()
  })
}
