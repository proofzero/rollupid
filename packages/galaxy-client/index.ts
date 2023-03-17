import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
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
  JSON: any;
  URN: any;
};

export type AddressProfile = {
  __typename?: 'AddressProfile';
  profile: AddressProfilesUnion;
  type: Scalars['String'];
  urn: Scalars['URN'];
};

export type AddressProfilesUnion = CryptoAddressProfile | EmailAddressProfile | OAuthAppleProfile | OAuthDiscordProfile | OAuthGithubProfile | OAuthGoogleProfile | OAuthMicrosoftProfile | OAuthTwitterProfile;

export type App = {
  __typename?: 'App';
  clientId: Scalars['String'];
  icon: Scalars['String'];
  timestamp: Scalars['Float'];
  title: Scalars['String'];
};

export type ConnectedAddressPropertiesUpdateInput = {
  addressURN: Scalars['URN'];
  public?: InputMaybe<Scalars['Boolean']>;
};

export type CryptoAddressProfile = {
  __typename?: 'CryptoAddressProfile';
  address: Scalars['String'];
  avatar?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
};

export type Edge = {
  __typename?: 'Edge';
  dst: Node;
  src: Node;
  tag: Scalars['String'];
};

export type EmailAddressProfile = {
  __typename?: 'EmailAddressProfile';
  address: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  disconnectAddress?: Maybe<Scalars['Boolean']>;
  revokeAppAuthorization?: Maybe<Scalars['Boolean']>;
  updateAddressNickname?: Maybe<Scalars['Boolean']>;
  updateConnectedAddressesProperties?: Maybe<Scalars['Boolean']>;
};


export type MutationDisconnectAddressArgs = {
  addressURN: Scalars['URN'];
};


export type MutationRevokeAppAuthorizationArgs = {
  clientId: Scalars['String'];
};


export type MutationUpdateAddressNicknameArgs = {
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
};


export type MutationUpdateConnectedAddressesPropertiesArgs = {
  addressURNList: Array<ConnectedAddressPropertiesUpdateInput>;
};

export type Nftpfp = {
  __typename?: 'NFTPFP';
  image?: Maybe<Scalars['String']>;
  isToken?: Maybe<Scalars['Boolean']>;
};

export type Node = {
  __typename?: 'Node';
  baseUrn: Scalars['String'];
  qc?: Maybe<Scalars['JSON']>;
  rc?: Maybe<Scalars['JSON']>;
};

export type NodeInput = {
  baseUrn: Scalars['String'];
  qc?: InputMaybe<Scalars['JSON']>;
  rc?: InputMaybe<Scalars['JSON']>;
};

export type OAuthAppleProfile = {
  __typename?: 'OAuthAppleProfile';
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthDiscordProfile = {
  __typename?: 'OAuthDiscordProfile';
  avatar?: Maybe<Scalars['String']>;
  discriminator?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  username?: Maybe<Scalars['String']>;
};

export type OAuthGithubProfile = {
  __typename?: 'OAuthGithubProfile';
  avatar_url: Scalars['String'];
  bio?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
  followers?: Maybe<Scalars['Int']>;
  following?: Maybe<Scalars['Int']>;
  html_url?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  location?: Maybe<Scalars['String']>;
  login: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  public_gists?: Maybe<Scalars['Int']>;
  public_repos?: Maybe<Scalars['Int']>;
};

export type OAuthGoogleProfile = {
  __typename?: 'OAuthGoogleProfile';
  email?: Maybe<Scalars['String']>;
  email_verified?: Maybe<Scalars['Boolean']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  locale?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthMicrosoftProfile = {
  __typename?: 'OAuthMicrosoftProfile';
  email?: Maybe<Scalars['String']>;
  family_name?: Maybe<Scalars['String']>;
  given_name?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  picture: Scalars['String'];
  sub?: Maybe<Scalars['String']>;
};

export type OAuthTwitterProfile = {
  __typename?: 'OAuthTwitterProfile';
  id?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  profile_image_url_https: Scalars['String'];
  screen_name: Scalars['String'];
};

export type Pfp = Nftpfp | StandardPfp;

export type PfpInput = {
  image: Scalars['String'];
  isToken?: InputMaybe<Scalars['Boolean']>;
};

export type Profile = {
  __typename?: 'Profile';
  displayName?: Maybe<Scalars['String']>;
  pfp?: Maybe<Pfp>;
};

export type ProfileInput = {
  displayName?: InputMaybe<Scalars['String']>;
  pfp?: InputMaybe<PfpInput>;
};

export type Query = {
  __typename?: 'Query';
  accountFromAlias: Scalars['URN'];
  addressProfile: AddressProfile;
  addressProfiles: Array<AddressProfile>;
  authorizedApps?: Maybe<Array<Maybe<App>>>;
  connectedAddresses?: Maybe<Array<Node>>;
  profile?: Maybe<Profile>;
  scopes: Array<Maybe<Scope>>;
};


export type QueryAccountFromAliasArgs = {
  alias: Scalars['String'];
  provider: Scalars['String'];
};


export type QueryAddressProfileArgs = {
  addressURN: Scalars['URN'];
};


export type QueryAddressProfilesArgs = {
  addressURNList?: InputMaybe<Array<Scalars['URN']>>;
};


export type QueryConnectedAddressesArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryProfileArgs = {
  targetAccountURN?: InputMaybe<Scalars['URN']>;
};


export type QueryScopesArgs = {
  clientId: Scalars['String'];
};

export type Scope = {
  __typename?: 'Scope';
  permission: Scalars['String'];
  scopes: Array<Maybe<Scalars['String']>>;
};

export type StandardPfp = {
  __typename?: 'StandardPFP';
  image?: Maybe<Scalars['String']>;
};

export type GetProfileQueryVariables = Exact<{
  targetAccountURN?: InputMaybe<Scalars['URN']>;
}>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'Profile', displayName?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null };

export type GetConnectedAddressesQueryVariables = Exact<{
  targetAccountURN?: InputMaybe<Scalars['URN']>;
}>;


export type GetConnectedAddressesQuery = { __typename?: 'Query', addresses?: Array<{ __typename?: 'Node', baseUrn: string, qc?: any | null, rc?: any | null }> | null };

export type GetAuthorizedAppsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthorizedAppsQuery = { __typename?: 'Query', authorizedApps?: Array<{ __typename?: 'App', clientId: string, icon: string, title: string, timestamp: number } | null> | null };

export type DisconnectAddressMutationVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type DisconnectAddressMutation = { __typename?: 'Mutation', disconnectAddress?: boolean | null };

export type GetAddressProfileQueryVariables = Exact<{
  addressURN: Scalars['URN'];
}>;


export type GetAddressProfileQuery = { __typename?: 'Query', addressProfile: { __typename?: 'AddressProfile', type: string, urn: any, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'EmailAddressProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthAppleProfile', name?: string | null, picture: string } | { __typename: 'OAuthDiscordProfile', email?: string | null, username?: string | null, discriminator?: string | null, avatar?: string | null, discordId?: string | null } | { __typename: 'OAuthGithubProfile', id?: number | null, name?: string | null, avatar_url: string, html_url?: string | null, followers?: number | null, following?: number | null, login: string, public_gists?: number | null, public_repos?: number | null } | { __typename: 'OAuthGoogleProfile', email?: string | null, name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthTwitterProfile', name?: string | null, screen_name: string, profile_image_url_https: string } } };

export type GetAddressProfilesQueryVariables = Exact<{
  addressURNList?: InputMaybe<Array<Scalars['URN']> | Scalars['URN']>;
}>;


export type GetAddressProfilesQuery = { __typename?: 'Query', addressProfiles: Array<{ __typename?: 'AddressProfile', type: string, urn: any, profile: { __typename: 'CryptoAddressProfile', address: string, avatar?: string | null, displayName?: string | null } | { __typename: 'EmailAddressProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthAppleProfile', name?: string | null, picture: string } | { __typename: 'OAuthDiscordProfile', email?: string | null, username?: string | null, discriminator?: string | null, avatar?: string | null, discordId?: string | null } | { __typename: 'OAuthGithubProfile', id?: number | null, name?: string | null, avatar_url: string, html_url?: string | null, followers?: number | null, following?: number | null, login: string, public_gists?: number | null, public_repos?: number | null } | { __typename: 'OAuthGoogleProfile', email?: string | null, name?: string | null, picture: string } | { __typename: 'OAuthMicrosoftProfile', name?: string | null, picture: string, email?: string | null } | { __typename: 'OAuthTwitterProfile', name?: string | null, screen_name: string, profile_image_url_https: string } }> };

export type GetAccountUrnFromAliasQueryVariables = Exact<{
  provider: Scalars['String'];
  alias: Scalars['String'];
}>;


export type GetAccountUrnFromAliasQuery = { __typename?: 'Query', accountFromAlias: any };

export type UpdateAddressNicknameMutationVariables = Exact<{
  addressURN: Scalars['URN'];
  nickname: Scalars['String'];
}>;


export type UpdateAddressNicknameMutation = { __typename?: 'Mutation', updateAddressNickname?: boolean | null };

export type UpdateConnectedAddressesPropertiesMutationVariables = Exact<{
  addressURNList: Array<ConnectedAddressPropertiesUpdateInput> | ConnectedAddressPropertiesUpdateInput;
}>;


export type UpdateConnectedAddressesPropertiesMutation = { __typename?: 'Mutation', updateConnectedAddressesProperties?: boolean | null };

export type GetAuthorizedAppScopesQueryVariables = Exact<{
  clientId: Scalars['String'];
}>;


export type GetAuthorizedAppScopesQuery = { __typename?: 'Query', scopes: Array<{ __typename?: 'Scope', permission: string, scopes: Array<string | null> } | null> };

export type RevokeAppAuthorizationMutationVariables = Exact<{
  clientId: Scalars['String'];
}>;


export type RevokeAppAuthorizationMutation = { __typename?: 'Mutation', revokeAppAuthorization?: boolean | null };


export const GetProfileDocument = gql`
    query getProfile($targetAccountURN: URN) {
  profile(targetAccountURN: $targetAccountURN) {
    pfp {
      ... on StandardPFP {
        image
      }
      ... on NFTPFP {
        image
        isToken
      }
    }
    displayName
  }
}
    `;
export const GetConnectedAddressesDocument = gql`
    query getConnectedAddresses($targetAccountURN: URN) {
  addresses: connectedAddresses(targetAccountURN: $targetAccountURN) {
    baseUrn
    qc
    rc
  }
}
    `;
export const GetAuthorizedAppsDocument = gql`
    query getAuthorizedApps {
  authorizedApps {
    clientId
    icon
    title
    timestamp
  }
}
    `;
export const DisconnectAddressDocument = gql`
    mutation disconnectAddress($addressURN: URN!) {
  disconnectAddress(addressURN: $addressURN)
}
    `;
export const GetAddressProfileDocument = gql`
    query getAddressProfile($addressURN: URN!) {
  addressProfile(addressURN: $addressURN) {
    type
    urn
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        email
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        screen_name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        id
        name
        avatar_url
        html_url
        followers
        following
        login
        public_gists
        public_repos
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
        email
      }
      ... on OAuthAppleProfile {
        name
        picture
      }
      ... on OAuthDiscordProfile {
        discordId: id
        email
        username
        discriminator
        avatar
      }
      ... on EmailAddressProfile {
        name
        picture
        email
      }
    }
  }
}
    `;
export const GetAddressProfilesDocument = gql`
    query getAddressProfiles($addressURNList: [URN!]) {
  addressProfiles(addressURNList: $addressURNList) {
    type
    urn
    profile {
      __typename
      ... on CryptoAddressProfile {
        address
        avatar
        displayName
      }
      ... on OAuthGoogleProfile {
        email
        name
        picture
      }
      ... on OAuthTwitterProfile {
        name
        screen_name
        profile_image_url_https
      }
      ... on OAuthGithubProfile {
        id
        name
        avatar_url
        html_url
        followers
        following
        login
        public_gists
        public_repos
      }
      ... on OAuthMicrosoftProfile {
        name
        picture
        email
      }
      ... on OAuthAppleProfile {
        name
        picture
      }
      ... on OAuthDiscordProfile {
        discordId: id
        email
        username
        discriminator
        avatar
      }
      ... on EmailAddressProfile {
        name
        picture
        email
      }
    }
  }
}
    `;
export const GetAccountUrnFromAliasDocument = gql`
    query getAccountUrnFromAlias($provider: String!, $alias: String!) {
  accountFromAlias(provider: $provider, alias: $alias)
}
    `;
export const UpdateAddressNicknameDocument = gql`
    mutation updateAddressNickname($addressURN: URN!, $nickname: String!) {
  updateAddressNickname(addressURN: $addressURN, nickname: $nickname)
}
    `;
export const UpdateConnectedAddressesPropertiesDocument = gql`
    mutation updateConnectedAddressesProperties($addressURNList: [ConnectedAddressPropertiesUpdateInput!]!) {
  updateConnectedAddressesProperties(addressURNList: $addressURNList)
}
    `;
export const GetAuthorizedAppScopesDocument = gql`
    query getAuthorizedAppScopes($clientId: String!) {
  scopes(clientId: $clientId) {
    permission
    scopes
  }
}
    `;
export const RevokeAppAuthorizationDocument = gql`
    mutation revokeAppAuthorization($clientId: String!) {
  revokeAppAuthorization(clientId: $clientId)
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    },
    getConnectedAddresses(variables?: GetConnectedAddressesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConnectedAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConnectedAddressesQuery>(GetConnectedAddressesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getConnectedAddresses', 'query');
    },
    getAuthorizedApps(variables?: GetAuthorizedAppsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAuthorizedAppsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAuthorizedAppsQuery>(GetAuthorizedAppsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAuthorizedApps', 'query');
    },
    disconnectAddress(variables: DisconnectAddressMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DisconnectAddressMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DisconnectAddressMutation>(DisconnectAddressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'disconnectAddress', 'mutation');
    },
    getAddressProfile(variables: GetAddressProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfileQuery>(GetAddressProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfile', 'query');
    },
    getAddressProfiles(variables?: GetAddressProfilesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAddressProfilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAddressProfilesQuery>(GetAddressProfilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAddressProfiles', 'query');
    },
    getAccountUrnFromAlias(variables: GetAccountUrnFromAliasQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAccountUrnFromAliasQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAccountUrnFromAliasQuery>(GetAccountUrnFromAliasDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAccountUrnFromAlias', 'query');
    },
    updateAddressNickname(variables: UpdateAddressNicknameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateAddressNicknameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAddressNicknameMutation>(UpdateAddressNicknameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateAddressNickname', 'mutation');
    },
    updateConnectedAddressesProperties(variables: UpdateConnectedAddressesPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateConnectedAddressesPropertiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateConnectedAddressesPropertiesMutation>(UpdateConnectedAddressesPropertiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateConnectedAddressesProperties', 'mutation');
    },
    getAuthorizedAppScopes(variables: GetAuthorizedAppScopesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAuthorizedAppScopesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAuthorizedAppScopesQuery>(GetAuthorizedAppScopesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAuthorizedAppScopes', 'query');
    },
    revokeAppAuthorization(variables: RevokeAppAuthorizationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RevokeAppAuthorizationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RevokeAppAuthorizationMutation>(RevokeAppAuthorizationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'revokeAppAuthorization', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;