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

export type AddressProfile = CryptoAddressProfile | GithubProfile | GoogleProfile | MicrosoftProfile | TwitterProfile;

export type AddressType = ContractAddressType | CryptoAddressType | HandleAddressType | OAuthAddressType;

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

export type MicrosoftProfile = {
  __typename?: 'MicrosoftProfile';
  email?: Maybe<Scalars['String']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture?: Maybe<Scalars['String']>;
  sub: Scalars['String'];
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

export type TwitterProfile = {
  __typename?: 'TwitterProfile';
  id: Scalars['Int'];
  name: Scalars['String'];
  profile_image_url: Scalars['String'];
  screen_name: Scalars['String'];
};
