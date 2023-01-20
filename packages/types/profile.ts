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
