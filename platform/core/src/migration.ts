import type { Environment } from './types'

import { Account } from '@proofzero/platform.account'
import { Authorization } from '@proofzero/platform.authorization'
import { Identity } from '@proofzero/platform.identity'

import { init } from '@proofzero/platform.edges/src/db'

export default async (limit: number, offset: number, env: Environment) => {
  const g = init(env.EDGES)

  const query = await g.db
    .prepare('SELECT urn FROM node ORDER BY urn')
    .all<{ urn: string }>()
  const urns = query.results
    ?.map(({ urn }) => urn)
    .slice(offset, offset + limit)

  if (!urns) return

  const addressURNs = urns.filter((urn) =>
    urn.startsWith('urn:rollupid:address')
  )
  const accountURNs = urns.filter((urn) =>
    urn.startsWith('urn:rollupid:account')
  )
  const accessURNs = urns.filter((urn) => urn.startsWith('urn:rollupid:access'))

  const accounts = await migrateAccounts(addressURNs, env.Account)
  const identities = await migrateIdentities(accountURNs, env.Identity)
  const authorizations = await migrateAuthorizations(
    accessURNs,
    env.Authorization
  )

  return {
    total: {
      found: addressURNs.length + accountURNs.length + accessURNs.length,
      migrated: accounts.length + identities.length + authorizations.length,
    },
    accounts: {
      found: addressURNs.length,
      migrated: accounts.length,
    },
    identities: {
      found: accountURNs.length,
      migrated: identities.length,
    },
    authorizations: {
      found: accessURNs.length,
      migrated: authorizations.length,
    },
  }

  // await Promise.all(deleteMigratedAccounts(addressURNs, env.Account))
  // await Promise.all(deleteMigratedIdentities(accountURNs, env.Identity))
  // await Promise.all(deleteMigratedAuthorizations(accessURNs, env.Authorization))
}

const getStringReplaceFunction =
  (search: string, replacement: string) =>
  (value: string): string =>
    value.replace(search, replacement)

const replaceAddressAsAccount = getStringReplaceFunction(
  'urn:rollupid:address',
  'urn:rollupid:account'
)

const replaceAccountAsIdentity = getStringReplaceFunction(
  'urn:rollupid:account',
  'urn:rollupid:identity'
)

const replaceAccessAsAuthorization = getStringReplaceFunction(
  'urn:rollupid:access',
  'urn:rollupid:authorization'
)

const migrateAccounts = async (
  urns: string[],
  AccountNamespace: DurableObjectNamespace
) => {
  const AccountProxy = Account.wrap(AccountNamespace)
  const result = await Promise.all(
    urns.map(async (urn) => {
      const addressNode = AccountProxy.getByName(urn)
      if (await addressNode.storage.get<boolean>('migrated')) return

      const accountNode = AccountProxy.getByName(replaceAddressAsAccount(urn))
      await accountNode.storage.put(
        Object.fromEntries((await addressNode.storage.list()).entries())
      )

      const accountURN = await accountNode.storage.get<string>('account')
      if (accountURN) {
        await accountNode.storage.delete('account')
        await accountNode.storage.put(
          'identity',
          replaceAccountAsIdentity(accountURN)
        )
      }

      await addressNode.storage.put('migrated', true)

      return urn
    })
  )

  return result.filter(Boolean)
}

const deleteMigratedAccounts = (
  urns: string[],
  AccountNamespace: DurableObjectNamespace
) => {
  const AccountProxy = Account.wrap(AccountNamespace)
  return urns.map(async (urn) => {
    const addressNode = AccountProxy.getByName(urn)
    const migrated = await addressNode.storage.get<boolean>('migrated')
    if (migrated) await addressNode.storage.deleteAll()
  })
}

const migrateIdentities = async (
  urns: string[],
  IdentityNamespace: DurableObjectNamespace
) => {
  const IdentityProxy = Identity.wrap(IdentityNamespace)
  const result = await Promise.all(
    urns.map(async (urn) => {
      const accountNode = IdentityProxy.getByName(urn)
      if (await accountNode.storage.get<boolean>('migrated')) return

      const identityNode = IdentityProxy.getByName(
        replaceAccountAsIdentity(urn)
      )

      await identityNode.storage.put(
        Object.fromEntries((await accountNode.storage.list()).entries())
      )

      const profile =
        await identityNode.storage.get<Record<string, string>>('profile')
      if (profile && profile['primaryAddressURN']) {
        profile['primaryAccountURN'] = replaceAddressAsAccount(
          profile['primaryAddressURN']
        )
        delete profile['primaryAddressURN']
        await identityNode.storage.put('profile', profile)
      }

      const addresses = await identityNode.storage.get<string[]>('addresses')
      if (addresses) {
        await identityNode.storage.delete('addresses')
        const accounts = addresses.map(replaceAddressAsAccount)
        identityNode.storage.put({ accounts })
      }

      const paymentData =
        await identityNode.storage.get<Record<string, string>>(
          'stripePaymentData'
        )

      if (paymentData && paymentData['addressURN']) {
        paymentData['accountURN'] = replaceAddressAsAccount(
          paymentData['addressURN']
        )
        delete paymentData['addressURN']
        await identityNode.storage.put({ paymentData })
      }

      await accountNode.storage.put('migrated', true)

      return urn
    })
  )
  return result.filter(Boolean)
}

const deleteMigratedIdentities = (
  urns: string[],
  IdentityNamespace: DurableObjectNamespace
) => {
  const IdentityProxy = Identity.wrap(IdentityNamespace)
  return urns.map(async (urn) => {
    const accountNode = IdentityProxy.getByName(urn)
    const migrated = await accountNode.storage.get<boolean>('migrated')
    if (migrated) await accountNode.storage.deleteAll()
  })
}

// AccessURN needs to be read from D1 -- cannot construct from the storage data
const migrateAuthorizations = async (
  urns: string[],
  AuthorizationNamespace: DurableObjectNamespace
) => {
  const AuthorizationProxy = Authorization.wrap(AuthorizationNamespace)
  const result = await Promise.all(
    urns.map(async (urn) => {
      const accessNode = AuthorizationProxy.getByName(
        urn.replace('urn:rollupid:access/', '')
      )

      if (await accessNode.storage.get<boolean>('migrated')) return

      const authorizationNode = AuthorizationProxy.getByName(
        replaceAccessAsAuthorization(urn)
      )

      const account = await authorizationNode.storage.get<string>('account')
      if (account) {
        await authorizationNode.storage.put(
          'identity',
          replaceAccountAsIdentity(account)
        )
        await authorizationNode.storage.delete('account')
      }

      await authorizationNode.storage.put(
        Object.fromEntries((await accessNode.storage.list()).entries())
      )

      const appData = await authorizationNode.storage.get<any>('appData')
      if (appData && Array.isArray(appData.smartWalletSessionKeys)) {
        appData.smartWalletSessionKeys = appData.smartWalletSessionKeys.map(
          (item: { urn: string }) => {
            item.urn = replaceAddressAsAccount(item.urn)
            return item
          }
        )
      }

      const personaData =
        await authorizationNode.storage.get<any>('personaData')
      if (personaData) {
        Object.entries(personaData).forEach(([key, value]) => {
          if (Array.isArray(value))
            personaData[key] = value
              .filter((v) => typeof v === 'string')
              .map(replaceAddressAsAccount)
        })
        await authorizationNode.storage.put('personaData', personaData)
      }

      await accessNode.storage.put('migrated', true)

      return urn
    })
  )

  return result.filter(Boolean)
}

const deleteMigratedAuthorizations = (
  urns: string[],
  AuthorizationNamespace: DurableObjectNamespace
) => {
  const AuthorizationProxy = Authorization.wrap(AuthorizationNamespace)
  return urns.map(async (urn) => {
    const accessNode = AuthorizationProxy.getByName(urn)
    const migrated = await accessNode.storage.get<boolean>('migrated')
    if (migrated) await accessNode.storage.deleteAll()
  })
}
