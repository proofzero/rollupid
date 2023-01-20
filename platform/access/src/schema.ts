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
  JWTString: any;
  ObjectURN: any;
  ProfileURN: any;
  UInt8Array: any;
  URN: any;
};

export type AuthenticationCodeGrant = CodeGrant & {
  __typename?: 'AuthenticationCodeGrant';
  clientId: Scalars['String'];
  code: Scalars['String'];
  grantType: GrantType;
  profile: Scalars['ProfileURN'];
  redirectUri: Scalars['String'];
};

export type AuthorizationCodeGrant = CodeGrant & {
  __typename?: 'AuthorizationCodeGrant';
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  code: Scalars['String'];
  grantType: GrantType;
  redirectUri: Scalars['String'];
};

export type AuthorizationResult = {
  __typename?: 'AuthorizationResult';
  code: Scalars['String'];
  state: Scalars['String'];
};

export type AuthorizeInput = {
  clientId: Scalars['String'];
  profile: Scalars['ProfileURN'];
  responseType: Scalars['String'];
  scope?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<Scalars['String']>;
};

export type CodeGrant = {
  grantType: GrantType;
};

export type ExchangeTokenResult = {
  __typename?: 'ExchangeTokenResult';
  accessToken: Scalars['String'];
  refreshToken: Scalars['String'];
};

export type GetSessionResult = {
  __typename?: 'GetSessionResult';
  session: SessionDetails;
};

export enum GrantType {
  AuthenticationCode = 'authentication_code',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token'
}

export type Jwt = {
  __typename?: 'JWT';
  aud?: Maybe<Scalars['String']>;
  exp?: Maybe<Scalars['Int']>;
  iat?: Maybe<Scalars['Int']>;
  iss?: Maybe<Scalars['String']>;
  jti?: Maybe<Scalars['String']>;
  nbf?: Maybe<Scalars['Int']>;
  sub?: Maybe<Scalars['String']>;
};

export type RefreshTokenGrant = CodeGrant & {
  __typename?: 'RefreshTokenGrant';
  grantType: GrantType;
  refreshToken: Scalars['String'];
  token: Scalars['JWTString'];
};

export enum ResponseType {
  Code = 'code'
}

export type RevokeSessionInput = {
  accessURN: Scalars['AccessURN'];
};

export type RevokeSessionResult = {
  __typename?: 'RevokeSessionResult';
  success: Scalars['Boolean'];
};

export type SessionDetails = {
  __typename?: 'SessionDetails';
  creation?: Maybe<Scalars['String']>;
  expired?: Maybe<Scalars['Boolean']>;
  expiry?: Maybe<Scalars['String']>;
};

export type TokenGrantInput = AuthenticationCodeGrant | AuthorizationCodeGrant | RefreshTokenGrant;

export type VerifyAuthorizationInput = {
  token?: InputMaybe<Scalars['JWTString']>;
};


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function AuthenticationCodeGrantSchema(): z.ZodObject<Properties<AuthenticationCodeGrant>> {
  return z.object<Properties<AuthenticationCodeGrant>>({
    __typename: z.literal('AuthenticationCodeGrant').optional(),
    clientId: z.string(),
    code: z.string(),
    grantType: GrantTypeSchema,
    profile: definedNonNullAnySchema,
    redirectUri: z.string()
  })
}

export function AuthorizationCodeGrantSchema(): z.ZodObject<Properties<AuthorizationCodeGrant>> {
  return z.object<Properties<AuthorizationCodeGrant>>({
    __typename: z.literal('AuthorizationCodeGrant').optional(),
    clientId: z.string(),
    clientSecret: z.string(),
    code: z.string(),
    grantType: GrantTypeSchema,
    redirectUri: z.string()
  })
}

export function AuthorizationResultSchema(): z.ZodObject<Properties<AuthorizationResult>> {
  return z.object<Properties<AuthorizationResult>>({
    __typename: z.literal('AuthorizationResult').optional(),
    code: z.string(),
    state: z.string()
  })
}

export function AuthorizeInputSchema(): z.ZodObject<Properties<AuthorizeInput>> {
  return z.object<Properties<AuthorizeInput>>({
    clientId: z.string(),
    profile: definedNonNullAnySchema,
    responseType: z.string(),
    scope: z.array(z.string()).nullish(),
    state: z.string().nullish()
  })
}

export function ExchangeTokenResultSchema(): z.ZodObject<Properties<ExchangeTokenResult>> {
  return z.object<Properties<ExchangeTokenResult>>({
    __typename: z.literal('ExchangeTokenResult').optional(),
    accessToken: z.string(),
    refreshToken: z.string()
  })
}

export function GetSessionResultSchema(): z.ZodObject<Properties<GetSessionResult>> {
  return z.object<Properties<GetSessionResult>>({
    __typename: z.literal('GetSessionResult').optional(),
    session: SessionDetailsSchema()
  })
}

export const GrantTypeSchema = z.nativeEnum(GrantType);

export function JwtSchema(): z.ZodObject<Properties<Jwt>> {
  return z.object<Properties<Jwt>>({
    __typename: z.literal('JWT').optional(),
    aud: z.string().nullish(),
    exp: z.number().nullish(),
    iat: z.number().nullish(),
    iss: z.string().nullish(),
    jti: z.string().nullish(),
    nbf: z.number().nullish(),
    sub: z.string().nullish()
  })
}

export function RefreshTokenGrantSchema(): z.ZodObject<Properties<RefreshTokenGrant>> {
  return z.object<Properties<RefreshTokenGrant>>({
    __typename: z.literal('RefreshTokenGrant').optional(),
    grantType: GrantTypeSchema,
    refreshToken: z.string(),
    token: definedNonNullAnySchema
  })
}

export const ResponseTypeSchema = z.nativeEnum(ResponseType);

export function RevokeSessionInputSchema(): z.ZodObject<Properties<RevokeSessionInput>> {
  return z.object<Properties<RevokeSessionInput>>({
    accessURN: definedNonNullAnySchema
  })
}

export function RevokeSessionResultSchema(): z.ZodObject<Properties<RevokeSessionResult>> {
  return z.object<Properties<RevokeSessionResult>>({
    __typename: z.literal('RevokeSessionResult').optional(),
    success: z.boolean()
  })
}

export function SessionDetailsSchema(): z.ZodObject<Properties<SessionDetails>> {
  return z.object<Properties<SessionDetails>>({
    __typename: z.literal('SessionDetails').optional(),
    creation: z.string().nullish(),
    expired: z.boolean().nullish(),
    expiry: z.string().nullish()
  })
}

export function TokenGrantInputSchema() {
  return z.union([AuthenticationCodeGrantSchema(), AuthorizationCodeGrantSchema(), RefreshTokenGrantSchema()])
}

export function VerifyAuthorizationInputSchema(): z.ZodObject<Properties<VerifyAuthorizationInput>> {
  return z.object<Properties<VerifyAuthorizationInput>>({
    token: definedNonNullAnySchema.nullish()
  })
}
