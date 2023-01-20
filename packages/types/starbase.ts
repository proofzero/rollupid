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
};

export type AppObject = {
  __typename?: 'AppObject';
  discordUser?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  mediumUser?: Maybe<Scalars['String']>;
  mirrorURL?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  redirectUri?: Maybe<Scalars['String']>;
  scopes: Array<Scalars['String']>;
  termsURL?: Maybe<Scalars['String']>;
  twitterUser?: Maybe<Scalars['String']>;
  websiteURL?: Maybe<Scalars['String']>;
};


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function AppObjectSchema(): z.ZodObject<Properties<AppObject>> {
  return z.object<Properties<AppObject>>({
    __typename: z.literal('AppObject').optional(),
    discordUser: z.string().nullish(),
    icon: z.string().nullish(),
    mediumUser: z.string().nullish(),
    mirrorURL: z.string().nullish(),
    name: z.string(),
    redirectUri: z.string().nullish(),
    scopes: z.array(z.string()),
    termsURL: z.string().nullish(),
    twitterUser: z.string().nullish(),
    websiteURL: z.string().nullish()
  })
}
