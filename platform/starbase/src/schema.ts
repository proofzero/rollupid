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

export type AppClientIdParam = {
  __typename?: 'AppClientIdParam';
  clientId: Scalars['String'];
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

export type AppUpdateableFields = {
  __typename?: 'AppUpdateableFields';
  app?: Maybe<AppObject>;
  clientName: Scalars['String'];
  published?: Maybe<Scalars['Boolean']>;
};

export type CheckApiKeyInput = {
  apiKey: Scalars['String'];
};

export type CheckApiKeyResult = {
  __typename?: 'CheckApiKeyResult';
  valid: Scalars['Boolean'];
};

export type CheckAppAuthInput = {
  clientId: Scalars['String'];
  clientSecret: Scalars['String'];
  redirectUri: Scalars['String'];
  scopes: Array<Scalars['String']>;
};

export type CheckAppAuthResult = {
  __typename?: 'CheckAppAuthResult';
  valid: Scalars['Boolean'];
};

export type CreateAppInput = {
  __typename?: 'CreateAppInput';
  clientName: Scalars['String'];
};

export type GetAppDetailsResult = {
  __typename?: 'GetAppDetailsResult';
  apiKeyTimestamp?: Maybe<Scalars['String']>;
  app?: Maybe<AppObject>;
  clientId: Scalars['String'];
  clientName: Scalars['String'];
  createdTimestamp?: Maybe<Scalars['String']>;
  published?: Maybe<Scalars['Boolean']>;
  secretTimestamp?: Maybe<Scalars['String']>;
};

export type ListAppsResult = {
  __typename?: 'ListAppsResult';
  apps: Array<GetAppDetailsResult>;
};

export type PublishAppInput = {
  clientId: Scalars['String'];
  published: Scalars['Boolean'];
};

export type PublishAppResult = {
  __typename?: 'PublishAppResult';
  published: Scalars['Boolean'];
};

export type RotateApiKeyResult = {
  __typename?: 'RotateApiKeyResult';
  apiKey: Scalars['String'];
};

export type RotateClientSecretResult = {
  __typename?: 'RotateClientSecretResult';
  secret: Scalars['String'];
};

export type UpdateAppInput = {
  clientId: Scalars['String'];
  updates?: InputMaybe<AppObject>;
};


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function AppClientIdParamSchema(): z.ZodObject<Properties<AppClientIdParam>> {
  return z.object<Properties<AppClientIdParam>>({
    __typename: z.literal('AppClientIdParam').optional(),
    clientId: z.string()
  })
}

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

export function AppUpdateableFieldsSchema(): z.ZodObject<Properties<AppUpdateableFields>> {
  return z.object<Properties<AppUpdateableFields>>({
    __typename: z.literal('AppUpdateableFields').optional(),
    app: AppObjectSchema().nullish(),
    clientName: z.string(),
    published: z.boolean().nullish()
  })
}

export function CheckApiKeyInputSchema(): z.ZodObject<Properties<CheckApiKeyInput>> {
  return z.object<Properties<CheckApiKeyInput>>({
    apiKey: z.string()
  })
}

export function CheckApiKeyResultSchema(): z.ZodObject<Properties<CheckApiKeyResult>> {
  return z.object<Properties<CheckApiKeyResult>>({
    __typename: z.literal('CheckApiKeyResult').optional(),
    valid: z.boolean()
  })
}

export function CheckAppAuthInputSchema(): z.ZodObject<Properties<CheckAppAuthInput>> {
  return z.object<Properties<CheckAppAuthInput>>({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string(),
    scopes: z.array(z.string())
  })
}

export function CheckAppAuthResultSchema(): z.ZodObject<Properties<CheckAppAuthResult>> {
  return z.object<Properties<CheckAppAuthResult>>({
    __typename: z.literal('CheckAppAuthResult').optional(),
    valid: z.boolean()
  })
}

export function CreateAppInputSchema(): z.ZodObject<Properties<CreateAppInput>> {
  return z.object<Properties<CreateAppInput>>({
    __typename: z.literal('CreateAppInput').optional(),
    clientName: z.string()
  })
}

export function GetAppDetailsResultSchema(): z.ZodObject<Properties<GetAppDetailsResult>> {
  return z.object<Properties<GetAppDetailsResult>>({
    __typename: z.literal('GetAppDetailsResult').optional(),
    apiKeyTimestamp: z.string().nullish(),
    app: AppObjectSchema().nullish(),
    clientId: z.string(),
    clientName: z.string(),
    createdTimestamp: z.string().nullish(),
    published: z.boolean().nullish(),
    secretTimestamp: z.string().nullish()
  })
}

export function ListAppsResultSchema(): z.ZodObject<Properties<ListAppsResult>> {
  return z.object<Properties<ListAppsResult>>({
    __typename: z.literal('ListAppsResult').optional(),
    apps: z.array(GetAppDetailsResultSchema())
  })
}

export function PublishAppInputSchema(): z.ZodObject<Properties<PublishAppInput>> {
  return z.object<Properties<PublishAppInput>>({
    clientId: z.string(),
    published: z.boolean()
  })
}

export function PublishAppResultSchema(): z.ZodObject<Properties<PublishAppResult>> {
  return z.object<Properties<PublishAppResult>>({
    __typename: z.literal('PublishAppResult').optional(),
    published: z.boolean()
  })
}

export function RotateApiKeyResultSchema(): z.ZodObject<Properties<RotateApiKeyResult>> {
  return z.object<Properties<RotateApiKeyResult>>({
    __typename: z.literal('RotateApiKeyResult').optional(),
    apiKey: z.string()
  })
}

export function RotateClientSecretResultSchema(): z.ZodObject<Properties<RotateClientSecretResult>> {
  return z.object<Properties<RotateClientSecretResult>>({
    __typename: z.literal('RotateClientSecretResult').optional(),
    secret: z.string()
  })
}

export function UpdateAppInputSchema(): z.ZodObject<Properties<UpdateAppInput>> {
  return z.object<Properties<UpdateAppInput>>({
    clientId: z.string(),
    updates: AppObjectSchema().nullish()
  })
}
