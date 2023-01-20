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
  UInt8Array: any;
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
