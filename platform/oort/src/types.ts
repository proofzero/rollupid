import { JWTPayload } from 'jose'
import Core from './core'
import { Packages } from './packages'

// The context is an object that provides resources from the environment and
// external services in the scope of a requets and response lifecycle. It is
// meant to be provided at the beginning of the process and be available during
// the cycle.
//
// The context object can be specialized by extending the interface and the
// implementation. The base interface declaration must apply to common
// properties of any cycle.
//
// The context object can be used to access objects which are not meant to be
// defined as a member of another in the code structure.

export interface Context {
  core: Core
  address: string
  claims: JWTPayload
  packages: Packages
}

export type Claims = string[]
