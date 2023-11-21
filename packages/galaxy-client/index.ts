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
};

export type AccountProfile = {
  __typename?: 'AccountProfile';
  address?: Maybe<Scalars['String']>;
  icon?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type App = {
  __typename?: 'App';
  clientId: Scalars['String'];
  icon: Scalars['String'];
  timestamp: Scalars['Float'];
  title: Scalars['String'];
};

export type ConnectedAccountPropertiesUpdateInput = {
  accountURN: Scalars['String'];
  public?: InputMaybe<Scalars['Boolean']>;
};

export type Edge = {
  __typename?: 'Edge';
  dst: Node;
  src: Node;
  tag: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  disconnectAccount?: Maybe<Scalars['Boolean']>;
  registerSessionKey: Scalars['String'];
  setExternalAppData?: Maybe<Scalars['Boolean']>;
  updateAccountNickname?: Maybe<Scalars['Boolean']>;
  updateConnectedAccountsProperties?: Maybe<Scalars['Boolean']>;
};


export type MutationDisconnectAccountArgs = {
  accountURN: Scalars['String'];
};


export type MutationRegisterSessionKeyArgs = {
  sessionPublicKey: Scalars['String'];
  smartContractWalletAddress: Scalars['String'];
};


export type MutationSetExternalAppDataArgs = {
  payload: Scalars['JSON'];
};


export type MutationUpdateAccountNicknameArgs = {
  accountURN: Scalars['String'];
  nickname: Scalars['String'];
};


export type MutationUpdateConnectedAccountsPropertiesArgs = {
  accountURNList: Array<ConnectedAccountPropertiesUpdateInput>;
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
  accountProfile: AccountProfile;
  accountProfiles: Array<AccountProfile>;
  authorizedApps?: Maybe<Array<Maybe<App>>>;
  connectedAccounts?: Maybe<Array<Node>>;
  getExternalAppData?: Maybe<Scalars['JSON']>;
  identityFromAlias: Scalars['String'];
  profile?: Maybe<Profile>;
};


export type QueryAccountProfileArgs = {
  accountURN: Scalars['String'];
};


export type QueryAccountProfilesArgs = {
  accountURNList?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryConnectedAccountsArgs = {
  targetIdentityURN?: InputMaybe<Scalars['String']>;
};


export type QueryIdentityFromAliasArgs = {
  alias: Scalars['String'];
  provider: Scalars['String'];
};


export type QueryProfileArgs = {
  targetIdentityURN?: InputMaybe<Scalars['String']>;
};

export type StandardPfp = {
  __typename?: 'StandardPFP';
  image?: Maybe<Scalars['String']>;
};

export type GetAccountProfileQueryVariables = Exact<{
  accountURN: Scalars['String'];
}>;


export type GetAccountProfileQuery = { __typename?: 'Query', accountProfile: { __typename?: 'AccountProfile', id: string, type?: string | null, address?: string | null, title?: string | null, icon?: string | null } };

export type GetAccountProfilesQueryVariables = Exact<{
  accountURNList?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type GetAccountProfilesQuery = { __typename?: 'Query', accountProfiles: Array<{ __typename?: 'AccountProfile', id: string, type?: string | null, address?: string | null, title?: string | null, icon?: string | null }> };

export type GetIdentityUrnFromAliasQueryVariables = Exact<{
  provider: Scalars['String'];
  alias: Scalars['String'];
}>;


export type GetIdentityUrnFromAliasQuery = { __typename?: 'Query', identityFromAlias: string };

export type UpdateAccountNicknameMutationVariables = Exact<{
  accountURN: Scalars['String'];
  nickname: Scalars['String'];
}>;


export type UpdateAccountNicknameMutation = { __typename?: 'Mutation', updateAccountNickname?: boolean | null };

export type UpdateConnectedAccountsPropertiesMutationVariables = Exact<{
  accountURNList: Array<ConnectedAccountPropertiesUpdateInput> | ConnectedAccountPropertiesUpdateInput;
}>;


export type UpdateConnectedAccountsPropertiesMutation = { __typename?: 'Mutation', updateConnectedAccountsProperties?: boolean | null };

export type GetExternalAppDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExternalAppDataQuery = { __typename?: 'Query', externalAppData?: any | null };

export type SetExternalAppDataMutationVariables = Exact<{
  payload: Scalars['JSON'];
}>;


export type SetExternalAppDataMutation = { __typename?: 'Mutation', setExternalAppData?: boolean | null };

export type GetProfileQueryVariables = Exact<{
  targetIdentityURN?: InputMaybe<Scalars['String']>;
}>;


export type GetProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'Profile', displayName?: string | null, pfp?: { __typename?: 'NFTPFP', image?: string | null, isToken?: boolean | null } | { __typename?: 'StandardPFP', image?: string | null } | null } | null };

export type GetConnectedAccountsQueryVariables = Exact<{
  targetIdentityURN?: InputMaybe<Scalars['String']>;
}>;


export type GetConnectedAccountsQuery = { __typename?: 'Query', accounts?: Array<{ __typename?: 'Node', baseUrn: string, qc?: any | null, rc?: any | null }> | null };

export type GetAuthorizedAppsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAuthorizedAppsQuery = { __typename?: 'Query', authorizedApps?: Array<{ __typename?: 'App', clientId: string, icon: string, title: string, timestamp: number } | null> | null };

export type DisconnectAccountMutationVariables = Exact<{
  accountURN: Scalars['String'];
}>;


export type DisconnectAccountMutation = { __typename?: 'Mutation', disconnectAccount?: boolean | null };


export const GetAccountProfileDocument = gql`
    query getAccountProfile($accountURN: String!) {
  accountProfile(accountURN: $accountURN) {
    id
    type
    address
    title
    icon
  }
}
    `;
export const GetAccountProfilesDocument = gql`
    query getAccountProfiles($accountURNList: [String!]) {
  accountProfiles(accountURNList: $accountURNList) {
    id
    type
    address
    title
    icon
  }
}
    `;
export const GetIdentityUrnFromAliasDocument = gql`
    query getIdentityURNFromAlias($provider: String!, $alias: String!) {
  identityFromAlias(provider: $provider, alias: $alias)
}
    `;
export const UpdateAccountNicknameDocument = gql`
    mutation updateAccountNickname($accountURN: String!, $nickname: String!) {
  updateAccountNickname(accountURN: $accountURN, nickname: $nickname)
}
    `;
export const UpdateConnectedAccountsPropertiesDocument = gql`
    mutation updateConnectedAccountsProperties($accountURNList: [ConnectedAccountPropertiesUpdateInput!]!) {
  updateConnectedAccountsProperties(accountURNList: $accountURNList)
}
    `;
export const GetExternalAppDataDocument = gql`
    query getExternalAppData {
  externalAppData: getExternalAppData
}
    `;
export const SetExternalAppDataDocument = gql`
    mutation setExternalAppData($payload: JSON!) {
  setExternalAppData(payload: $payload)
}
    `;
export const GetProfileDocument = gql`
    query getProfile($targetIdentityURN: String) {
  profile(targetIdentityURN: $targetIdentityURN) {
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
export const GetConnectedAccountsDocument = gql`
    query getConnectedAccounts($targetIdentityURN: String) {
  accounts: connectedAccounts(targetIdentityURN: $targetIdentityURN) {
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
export const DisconnectAccountDocument = gql`
    mutation disconnectAccount($accountURN: String!) {
  disconnectAccount(accountURN: $accountURN)
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getAccountProfile(variables: GetAccountProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAccountProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAccountProfileQuery>(GetAccountProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAccountProfile', 'query');
    },
    getAccountProfiles(variables?: GetAccountProfilesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAccountProfilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAccountProfilesQuery>(GetAccountProfilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAccountProfiles', 'query');
    },
    getIdentityURNFromAlias(variables: GetIdentityUrnFromAliasQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetIdentityUrnFromAliasQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetIdentityUrnFromAliasQuery>(GetIdentityUrnFromAliasDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getIdentityURNFromAlias', 'query');
    },
    updateAccountNickname(variables: UpdateAccountNicknameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateAccountNicknameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateAccountNicknameMutation>(UpdateAccountNicknameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateAccountNickname', 'mutation');
    },
    updateConnectedAccountsProperties(variables: UpdateConnectedAccountsPropertiesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateConnectedAccountsPropertiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateConnectedAccountsPropertiesMutation>(UpdateConnectedAccountsPropertiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateConnectedAccountsProperties', 'mutation');
    },
    getExternalAppData(variables?: GetExternalAppDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetExternalAppDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetExternalAppDataQuery>(GetExternalAppDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getExternalAppData', 'query');
    },
    setExternalAppData(variables: SetExternalAppDataMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetExternalAppDataMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetExternalAppDataMutation>(SetExternalAppDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setExternalAppData', 'mutation');
    },
    getProfile(variables?: GetProfileQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProfileQuery>(GetProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProfile', 'query');
    },
    getConnectedAccounts(variables?: GetConnectedAccountsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConnectedAccountsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConnectedAccountsQuery>(GetConnectedAccountsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getConnectedAccounts', 'query');
    },
    getAuthorizedApps(variables?: GetAuthorizedAppsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAuthorizedAppsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAuthorizedAppsQuery>(GetAuthorizedAppsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAuthorizedApps', 'query');
    },
    disconnectAccount(variables: DisconnectAccountMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DisconnectAccountMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DisconnectAccountMutation>(DisconnectAccountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'disconnectAccount', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;