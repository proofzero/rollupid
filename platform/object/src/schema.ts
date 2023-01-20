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
  EdgeURN: any;
  JSON: any;
  ObjectURN: any;
  ProfileURN: any;
  URN: any;
};

export type GetObjectInput = {
  namespace: Scalars['String'];
  path: Scalars['String'];
};

export type GetObjectOutput = {
  __typename?: 'GetObjectOutput';
  value: Scalars['JSON'];
  version: Scalars['Int'];
};

export type IndexRecord = {
  __typename?: 'IndexRecord';
  version: Scalars['Int'];
  visibility: Visibility;
};

export type PutObjectInput = {
  namespace: Scalars['String'];
  path: Scalars['String'];
  value: Scalars['JSON'];
  visibility: Visibility;
};

export type PutObjectOutput = {
  __typename?: 'PutObjectOutput';
  size: Scalars['Int'];
  version: Scalars['Int'];
};

export enum Visibility {
  Private = 'private',
  Public = 'public'
}


type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function GetObjectInputSchema(): z.ZodObject<Properties<GetObjectInput>> {
  return z.object<Properties<GetObjectInput>>({
    namespace: z.string(),
    path: z.string()
  })
}

export function GetObjectOutputSchema(): z.ZodObject<Properties<GetObjectOutput>> {
  return z.object<Properties<GetObjectOutput>>({
    __typename: z.literal('GetObjectOutput').optional(),
    value: definedNonNullAnySchema,
    version: z.number()
  })
}

export function IndexRecordSchema(): z.ZodObject<Properties<IndexRecord>> {
  return z.object<Properties<IndexRecord>>({
    __typename: z.literal('IndexRecord').optional(),
    version: z.number(),
    visibility: VisibilitySchema
  })
}

export function PutObjectInputSchema(): z.ZodObject<Properties<PutObjectInput>> {
  return z.object<Properties<PutObjectInput>>({
    namespace: z.string(),
    path: z.string(),
    value: definedNonNullAnySchema,
    visibility: VisibilitySchema
  })
}

export function PutObjectOutputSchema(): z.ZodObject<Properties<PutObjectOutput>> {
  return z.object<Properties<PutObjectOutput>>({
    __typename: z.literal('PutObjectOutput').optional(),
    size: z.number(),
    version: z.number()
  })
}

export const VisibilitySchema = z.nativeEnum(Visibility);
