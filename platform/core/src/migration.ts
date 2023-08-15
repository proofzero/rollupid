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

  console.log(`TOTAL URNS: ${urns?.length}`)

  if (!urns) return

  const addressURNs = urns.filter((urn) =>
    urn.startsWith('urn:rollupid:address')
  )
  const accountURNs = urns.filter((urn) =>
    urn.startsWith('urn:rollupid:account')
  )
  const accessURNs = urns.filter((urn) => urn.startsWith('urn:rollupid:access'))

  console.log(`address count ${addressURNs.length}`)
  console.log(`account count ${accountURNs.length}`)
  console.log(`access count ${accessURNs.length}`)

  console.log('MIGRATE ACCOUNTS START')
  await Promise.all(migrateAccounts(addressURNs, env.Account))
  // await Promise.all(deleteMigratedAccounts(addressURNs, env.Account))
  console.log('MIGRATE ACCOUNTS END')

  console.log('MIGRATE IDENTITIES START')
  await Promise.all(migrateIdentities(accountURNs, env.Identity))
  // await Promise.all(deleteMigratedIdentities(accountURNs, env.Identity))
  console.log('MIGRATE IDENTITIES END')

  console.log('MIGRATE AUTHORIZATIONS START')
  await Promise.all(migrateAuthorizations(accessURNs, env.Authorization))
  // await Promise.all(deleteMigratedAuthorizations(accessURNs, env.Authorization))
  console.log('MIGRATE AUTHORIZATIONS END')
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

const migrateAccounts = (
  urns: string[],
  AccountNamespace: DurableObjectNamespace
) => {
  const AccountProxy = Account.wrap(AccountNamespace)
  return urns.map(async (urn) => {
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

    // console.log(
    //   JSON.stringify(
    //     {
    //       address: Object.fromEntries(
    //         (await addressNode.storage.list()).entries()
    //       ),
    //       account: Object.fromEntries(
    //         (await accountNode.storage.list()).entries()
    //       ),
    //     },
    //     null,
    //     2
    //   )
    // )
  })
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

const migrateIdentities = (
  urns: string[],
  IdentityNamespace: DurableObjectNamespace
) => {
  const IdentityProxy = Identity.wrap(IdentityNamespace)
  return urns.map(async (urn) => {
    const accountNode = IdentityProxy.getByName(urn)
    if (await accountNode.storage.get<boolean>('migrated')) return

    const identityNode = IdentityProxy.getByName(replaceAccountAsIdentity(urn))

    await identityNode.storage.put(
      Object.fromEntries((await accountNode.storage.list()).entries())
    )

    const profile = await identityNode.storage.get<Record<string, string>>(
      'profile'
    )
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

    await accountNode.storage.put('migrated', true)

    // console.log(
    //   JSON.stringify(
    //     {
    //       address: Object.fromEntries(
    //         (await accountNode.storage.list()).entries()
    //       ),
    //       account: Object.fromEntries(
    //         (await identityNode.storage.list()).entries()
    //       ),
    //     },
    //     null,
    //     2
    //   )
    // )
  })
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
const migrateAuthorizations = (
  urns: string[],
  AuthorizationNamespace: DurableObjectNamespace
) => {
  const AuthorizationProxy = Authorization.wrap(AuthorizationNamespace)
  return urns.map(async (urn) => {
    const accessNode = AuthorizationProxy.getByName(
      urn.replace('urn:rollupid:access/', '')
    )

    if (await accessNode.storage.get<boolean>('migrated')) return

    const authorizationNode = AuthorizationProxy.getByName(
      replaceAccessAsAuthorization(urn)
    )

    await authorizationNode.storage.put(
      Object.fromEntries((await accessNode.storage.list()).entries())
    )

    await accessNode.storage.put('migrated', true)

    const personaData = await authorizationNode.storage.get<any>('personaData')
    if (personaData) {
      Object.entries(personaData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          personaData[key] = value.map(replaceAddressAsAccount)
        }
      })
      await authorizationNode.storage.put('personaData', personaData)
    }

    // console.log(
    //   JSON.stringify(
    //     {
    //       access: Object.fromEntries(
    //         (await accessNode.storage.list()).entries()
    //       ),
    //       authorization: Object.fromEntries(
    //         (await authorizationNode.storage.list()).entries()
    //       ),
    //     },
    //     null,
    //     2
    //   )
    // )
  })
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
