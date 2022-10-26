import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateThreeIDAddress?: Maybe<ThreeIdAddress>;
  updateThreeIDProfile?: Maybe<Scalars['Boolean']>;
};


export type MutationUpdateThreeIdAddressArgs = {
  address: ThreeIdAddressInput;
  visible?: InputMaybe<Scalars['Boolean']>;
};


export type MutationUpdateThreeIdProfileArgs = {
  profile?: InputMaybe<ThreeIdProfileInput>;
  visibility: Visibility;
};

export type Query = {
  __typename?: 'Query';
  address?: Maybe<ThreeIdAddress>;
  addresses?: Maybe<Array<Maybe<ThreeIdAddress>>>;
  profile?: Maybe<ThreeIdProfile>;
  profileFromAddress?: Maybe<ThreeIdProfile>;
};


export type QueryAddressArgs = {
  address: Scalars['String'];
};


export type QueryProfileArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryProfileFromAddressArgs = {
  address: Scalars['String'];
};

export type ThreeIdAddress = {
  __typename?: 'ThreeIDAddress';
  address: Scalars['String'];
  threeID: Scalars['ID'];
  type: ThreeIdAddressType;
  visibility: Visibility;
};

export type ThreeIdAddressInput = {
  address: Scalars['String'];
  threeID: Scalars['ID'];
  type: ThreeIdAddressType;
  visibility: Visibility;
};

export enum ThreeIdAddressType {
  Email = 'EMAIL',
  Ens = 'ENS',
  Ethereum = 'ETHEREUM'
}

export type ThreeIdProfile = {
  __typename?: 'ThreeIDProfile';
  addresses?: Maybe<Array<ThreeIdAddress>>;
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  cover?: Maybe<Scalars['String']>;
  displayName?: Maybe<Scalars['String']>;
  isToken?: Maybe<Scalars['Boolean']>;
  job?: Maybe<Scalars['String']>;
  location?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
};

export type ThreeIdProfileInput = {
  avatar?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  cover?: InputMaybe<Scalars['String']>;
  displayName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  isToken?: InputMaybe<Scalars['Boolean']>;
  job?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export enum Visibility {
  Private = 'PRIVATE',
  Protected = 'PROTECTED',
  Public = 'PUBLIC'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ThreeIDAddress: ResolverTypeWrapper<ThreeIdAddress>;
  ThreeIDAddressInput: ThreeIdAddressInput;
  ThreeIDAddressType: ThreeIdAddressType;
  ThreeIDProfile: ResolverTypeWrapper<ThreeIdProfile>;
  ThreeIDProfileInput: ThreeIdProfileInput;
  Visibility: Visibility;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  ID: Scalars['ID'];
  Mutation: {};
  Query: {};
  String: Scalars['String'];
  ThreeIDAddress: ThreeIdAddress;
  ThreeIDAddressInput: ThreeIdAddressInput;
  ThreeIDProfile: ThreeIdProfile;
  ThreeIDProfileInput: ThreeIdProfileInput;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateThreeIDAddress?: Resolver<Maybe<ResolversTypes['ThreeIDAddress']>, ParentType, ContextType, RequireFields<MutationUpdateThreeIdAddressArgs, 'address'>>;
  updateThreeIDProfile?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUpdateThreeIdProfileArgs, 'visibility'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  address?: Resolver<Maybe<ResolversTypes['ThreeIDAddress']>, ParentType, ContextType, RequireFields<QueryAddressArgs, 'address'>>;
  addresses?: Resolver<Maybe<Array<Maybe<ResolversTypes['ThreeIDAddress']>>>, ParentType, ContextType>;
  profile?: Resolver<Maybe<ResolversTypes['ThreeIDProfile']>, ParentType, ContextType, Partial<QueryProfileArgs>>;
  profileFromAddress?: Resolver<Maybe<ResolversTypes['ThreeIDProfile']>, ParentType, ContextType, RequireFields<QueryProfileFromAddressArgs, 'address'>>;
};

export type ThreeIdAddressResolvers<ContextType = any, ParentType extends ResolversParentTypes['ThreeIDAddress'] = ResolversParentTypes['ThreeIDAddress']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  threeID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ThreeIDAddressType'], ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['Visibility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ThreeIdProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['ThreeIDProfile'] = ResolversParentTypes['ThreeIDProfile']> = {
  addresses?: Resolver<Maybe<Array<ResolversTypes['ThreeIDAddress']>>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cover?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isToken?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ThreeIDAddress?: ThreeIdAddressResolvers<ContextType>;
  ThreeIDProfile?: ThreeIdProfileResolvers<ContextType>;
};

