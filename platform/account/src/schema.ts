import { z } from 'zod'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AccessURN: any;
  AddressURN: any;
  AppURN: any;
  EdgeURN: any;
  ObjectURN: any;
  ProfileURN: any;
  ScopeURN: any;
  URN: any;
};

export type AddressProfile = CryptoAddressProfile | GithubProfile | GoogleProfile | MicrosoftProfile | TwitterProfile;

export type AddressType = ContractAddressType | CryptoAddressType | HandleAddressType | OAuthAddressType;

export type AddressesFilter = {
  __typename?: 'AddressesFilter';
  type: AddressType;
};

export type Avatar = {
  __typename?: 'Avatar';
  image: Scalars['String'];
  isToken?: Maybe<Scalars['Boolean']>;
};

export type Challenge = {
  __typename?: 'Challenge';
  address: Scalars['String'];
  redirectUri: Scalars['String'];
  scope: Scalars['String'];
  state: Scalars['String'];
  template: Scalars['String'];
  timestamp: Scalars['String'];
};

export enum ContractAddressType {
  Eth = 'eth'
}

export type CryptoAddressProfile = {
  __typename?: 'CryptoAddressProfile';
  address: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  diplayName?: Maybe<Scalars['String']>;
};

export enum CryptoAddressType {
  Eth = 'eth'
}

export type Edge = {
  __typename?: 'Edge';
  dst: Node;
  id: Scalars['URN'];
  perms: Array<Scalars['String']>;
  src: Node;
  tag: Scalars['EdgeURN'];
};

export type GetAddressesInput = {
  filter?: InputMaybe<AddressesFilter>;
  profile: Scalars['ProfileURN'];
};

export type GetAddressesOutput = {
  __typename?: 'GetAddressesOutput';
  addresses?: Maybe<Array<Node>>;
};

export type GetProfileInput = {
  profile: Scalars['ProfileURN'];
};

export type GetProfileResult = {
  __typename?: 'GetProfileResult';
  addresses?: Maybe<Array<Node>>;
  profile?: Maybe<Profile>;
};

export type GithubProfile = {
  __typename?: 'GithubProfile';
  avatar_url: Scalars['String'];
  bio?: Maybe<Scalars['String']>;
  blog?: Maybe<Scalars['String']>;
  company?: Maybe<Scalars['String']>;
  created_at: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  events_url: Scalars['String'];
  followers: Scalars['Int'];
  followers_url: Scalars['String'];
  following: Scalars['Int'];
  following_url: Scalars['String'];
  gists_url: Scalars['String'];
  gravatar_id?: Maybe<Scalars['String']>;
  hireable?: Maybe<Scalars['Boolean']>;
  html_url: Scalars['String'];
  id: Scalars['Int'];
  location?: Maybe<Scalars['String']>;
  login: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  node_id: Scalars['String'];
  organizations_url: Scalars['String'];
  public_gists: Scalars['Int'];
  public_repos: Scalars['Int'];
  received_events_url: Scalars['String'];
  repos_url: Scalars['String'];
  site_admin: Scalars['Boolean'];
  starred_url: Scalars['String'];
  subscriptions_url: Scalars['String'];
  twitter_username?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  updated_at: Scalars['String'];
  url: Scalars['String'];
};

export type GoogleProfile = {
  __typename?: 'GoogleProfile';
  email?: Maybe<Scalars['String']>;
  email_verified?: Maybe<Scalars['Boolean']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture?: Maybe<Scalars['String']>;
  sub: Scalars['String'];
};

export enum HandleAddressType {
  Handle = 'handle'
}

export type Link = {
  __typename?: 'Link';
  name: Scalars['String'];
  url: Scalars['String'];
  verified?: Maybe<Scalars['Boolean']>;
};

export type MicrosoftProfile = {
  __typename?: 'MicrosoftProfile';
  email?: Maybe<Scalars['String']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture?: Maybe<Scalars['String']>;
  sub: Scalars['String'];
};

export type Node = {
  __typename?: 'Node';
  fragment?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['URN']>;
  nid?: Maybe<Scalars['String']>;
  nss?: Maybe<Scalars['String']>;
  qc: Array<Qc>;
  rc: Array<Rc>;
  urn?: Maybe<Scalars['URN']>;
};

export enum NodeType {
  Contract = 'contract',
  Crypto = 'crypto',
  Handle = 'handle',
  Oauth = 'oauth',
  Vault = 'vault'
}

export enum OAuthAddressType {
  Apple = 'apple',
  Discord = 'discord',
  Github = 'github',
  Google = 'google',
  Microsoft = 'microsoft',
  Twitter = 'twitter'
}

export type OAuthData = {
  __typename?: 'OAuthData';
  accessToken: Scalars['String'];
  accessTokenSecret?: Maybe<Scalars['String']>;
  extraParams?: Maybe<OAuthExtraParams>;
  profile?: Maybe<OAuthProfile>;
  refreshToken?: Maybe<Scalars['String']>;
};

export type OAuthExtraParams = {
  __typename?: 'OAuthExtraParams';
  expires_in?: Maybe<Scalars['Int']>;
  id_token?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['String']>;
  token_type?: Maybe<Scalars['String']>;
};

export type OAuthProfile = OAuthProfileJson | TwitterProfile;

export type OAuthProfileJson = {
  __typename?: 'OAuthProfileJson';
  _json: AddressProfile;
  provider: Scalars['String'];
};

export type Profile = {
  __typename?: 'Profile';
  avatar?: Maybe<Avatar>;
  bio?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  handle?: Maybe<Scalars['String']>;
  job?: Maybe<Scalars['String']>;
  links?: Maybe<Array<Maybe<Link>>>;
  location?: Maybe<Scalars['String']>;
};

export type Qc = {
  __typename?: 'QC';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type Rc = {
  __typename?: 'RC';
  key?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

export type SetProfileInput = {
  profile: Profile;
};

export type TwitterProfile = {
  __typename?: 'TwitterProfile';
  id: Scalars['Int'];
  name: Scalars['String'];
  profile_image_url: Scalars['String'];
  screen_name: Scalars['String'];
};


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

export function AddressesFilterSchema(): z.ZodObject<Properties<AddressesFilter>> {
  return z.object<Properties<AddressesFilter>>({
    __typename: z.literal('AddressesFilter').optional(),
    type: AddressTypeSchema()
  })
}

export function AvatarSchema(): z.ZodObject<Properties<Avatar>> {
  return z.object<Properties<Avatar>>({
    __typename: z.literal('Avatar').optional(),
    image: z.string(),
    isToken: z.boolean().nullish()
  })
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

export function EdgeSchema(): z.ZodObject<Properties<Edge>> {
  return z.object<Properties<Edge>>({
    __typename: z.literal('Edge').optional(),
    dst: NodeSchema(),
    id: definedNonNullAnySchema,
    perms: z.array(z.string()),
    src: NodeSchema(),
    tag: definedNonNullAnySchema
  })
}

export function GetAddressesInputSchema(): z.ZodObject<Properties<GetAddressesInput>> {
  return z.object<Properties<GetAddressesInput>>({
    filter: AddressesFilterSchema().nullish(),
    profile: definedNonNullAnySchema
  })
}

export function GetAddressesOutputSchema(): z.ZodObject<Properties<GetAddressesOutput>> {
  return z.object<Properties<GetAddressesOutput>>({
    __typename: z.literal('GetAddressesOutput').optional(),
    addresses: z.array(NodeSchema()).nullish()
  })
}

export function GetProfileInputSchema(): z.ZodObject<Properties<GetProfileInput>> {
  return z.object<Properties<GetProfileInput>>({
    profile: definedNonNullAnySchema
  })
}

export function GetProfileResultSchema(): z.ZodObject<Properties<GetProfileResult>> {
  return z.object<Properties<GetProfileResult>>({
    __typename: z.literal('GetProfileResult').optional(),
    addresses: z.array(NodeSchema()).nullish(),
    profile: ProfileSchema().nullish()
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

export function LinkSchema(): z.ZodObject<Properties<Link>> {
  return z.object<Properties<Link>>({
    __typename: z.literal('Link').optional(),
    name: z.string(),
    url: z.string(),
    verified: z.boolean().nullish()
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

export function NodeSchema(): z.ZodObject<Properties<Node>> {
  return z.object<Properties<Node>>({
    __typename: z.literal('Node').optional(),
    fragment: z.string().nullish(),
    id: definedNonNullAnySchema.nullish(),
    nid: z.string().nullish(),
    nss: z.string().nullish(),
    qc: z.array(QcSchema()),
    rc: z.array(RcSchema()),
    urn: definedNonNullAnySchema.nullish()
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

export function ProfileSchema(): z.ZodObject<Properties<Profile>> {
  return z.object<Properties<Profile>>({
    __typename: z.literal('Profile').optional(),
    avatar: AvatarSchema().nullish(),
    bio: z.string().nullish(),
    cover: z.string().nullish(),
    displayName: z.string().nullish(),
    handle: z.string().nullish(),
    job: z.string().nullish(),
    links: z.array(LinkSchema().nullable()).nullish(),
    location: z.string().nullish()
  })
}

export function QcSchema(): z.ZodObject<Properties<Qc>> {
  return z.object<Properties<Qc>>({
    __typename: z.literal('QC').optional(),
    key: z.string().nullish(),
    value: z.string().nullish()
  })
}

export function RcSchema(): z.ZodObject<Properties<Rc>> {
  return z.object<Properties<Rc>>({
    __typename: z.literal('RC').optional(),
    key: z.string().nullish(),
    value: z.string().nullish()
  })
}

export function SetProfileInputSchema(): z.ZodObject<Properties<SetProfileInput>> {
  return z.object<Properties<SetProfileInput>>({
    profile: ProfileSchema()
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
