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

export type Avatar = {
  __typename?: 'Avatar';
  image: Scalars['String'];
  isToken?: Maybe<Scalars['Boolean']>;
};

export type Link = {
  __typename?: 'Link';
  name: Scalars['String'];
  url: Scalars['String'];
  verified?: Maybe<Scalars['Boolean']>;
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


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function AvatarSchema(): z.ZodObject<Properties<Avatar>> {
  return z.object<Properties<Avatar>>({
    __typename: z.literal('Avatar').optional(),
    image: z.string(),
    isToken: z.boolean().nullish()
  })
}

export function LinkSchema(): z.ZodObject<Properties<Link>> {
  return z.object<Properties<Link>>({
    __typename: z.literal('Link').optional(),
    name: z.string(),
    url: z.string(),
    verified: z.boolean().nullish()
  })
}

export function ProfileSchema(): z.ZodObject<Properties<Profile>> {
  return z.object<Properties<Profile>>({
    __typename: z.literal('Profile').optional(),
    avatar: AvatarSchema().nullish(),
    bio: z.string().max(256).nullish(),
    cover: z.string().nullish(),
    displayName: z.string().max(50).nullish(),
    handle: z.string().min(3).max(15).nullish(),
    job: z.string().max(30).nullish(),
    links: z.array(LinkSchema().nullable()).nullish(),
    location: z.string().max(30).nullish()
  })
}
