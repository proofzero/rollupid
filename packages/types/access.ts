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
  JWTString: any;
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

export enum ResponseType {
  Code = 'code'
}

export type SessionDetails = {
  __typename?: 'SessionDetails';
  creation?: Maybe<Scalars['String']>;
  expired?: Maybe<Scalars['Boolean']>;
  expiry?: Maybe<Scalars['String']>;
};

export type VerifyAuthorizationInput = {
  token?: InputMaybe<Scalars['JWTString']>;
};


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

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

export const ResponseTypeSchema = z.nativeEnum(ResponseType);

export function SessionDetailsSchema(): z.ZodObject<Properties<SessionDetails>> {
  return z.object<Properties<SessionDetails>>({
    __typename: z.literal('SessionDetails').optional(),
    creation: z.string().nullish(),
    expired: z.boolean().nullish(),
    expiry: z.string().nullish()
  })
}

export function VerifyAuthorizationInputSchema(): z.ZodObject<Properties<VerifyAuthorizationInput>> {
  return z.object<Properties<VerifyAuthorizationInput>>({
    token: z.string().nullish()
  })
}
