/**
 * @file app/models/app.server.ts
 */

import invariant from 'tiny-invariant'

//import cuid from "cuid";

//import type { User } from "./user.server";

import * as _ from 'lodash'

// Invariants
// -----------------------------------------------------------------------------

// Ensure that STORAGE_NAMESPACE is defined.
invariant(STORAGE_NAMESPACE !== undefined, 'STORAGE_NAMESPACE must be defined')

// Definitions
// -----------------------------------------------------------------------------

export const APP_NAME_MAX_LENGTH = 100

// Scope
// -----------------------------------------------------------------------------

export type Scope = {
  name: string
  category: string
  permission: string
}

// Application
// -----------------------------------------------------------------------------
// An Application configuration.

// Nominal types.

export type AppID = string

export type DateString = string

export type URLString = string

export type Application = {
  // Unique application identifier.
  id: AppID
  // Creation date.
  createdDate: DateString
  // Published?
  published: boolean
  // Human-readable name.
  name: string
  // URL of the application icon.
  icon: string
  // Secret
  secret: string
  // oAuth redirect URL.
  redirectURL: URLString
  // oAuth ToS URL.
  termsURL: URLString
  // oAuth domains
  domains: Array<string>
  // oAuth scopes
  scopes: Array<Scope>
  // URL of application website
  websiteURL: URLString
  // URL of mirror website
  mirrorURL: URLString
  // Discord username
  discordUser: string
  // Medium username
  mediumUser: string
  // Twitter username
  twitterUser: string
}

// ApplicationItem
// -----------------------------------------------------------------------------
// An Application is exclusively owned by a single user.

/*
type ApplicationItem = {
  pk: User["id"];
  sk: `app#${app["id"]}`;
};

const skToId = (sk: DappItem["sk"]): Dapp["id"] => sk.replace(/^dapp#/, "");
const idToSk = (id: Dapp["id"]): DappItem["sk"] => `dapp#${id}`;
*/

// getScopes
// -----------------------------------------------------------------------------

/**
 * Return a list of all scopes.
 */
export async function getScopes(): Promise<Array<Scope> | null> {
  return new Promise((resolve, reject) => {
    // TEMP
    const scopes = [
      {
        id: 1,
        name: 'profile.all_data',
        category: 'Profile',
        permission: 'All Data',
      },
      {
        id: 2,
        name: 'profile.some_data',
        category: 'Profile',
        permission: 'Some Data',
      },
      {
        id: 3,
        name: 'contract.read_only',
        category: 'Contracts',
        permission: 'Read Only',
      },
      {
        id: 4,
        name: 'contract.write_only',
        category: 'Contracts',
        permission: 'Write Only',
      },
    ]
    resolve(scopes)
  })
}

// getApplication
// -----------------------------------------------------------------------------
/*
const app = {
  id: appId,
  published: true,
  name: "Courtyard",
  icon: genericIcon,
  secret: "s3kri7",
  redirectURL: "example.com/redirect",
  termsURL: "example.com/terms",
  websiteURL: "www.example.com",
  mirrorURL: "mirror.example.com",
  discordUser: "joey",
  twitterUser: "jimjam",
  domains: [
    "icarus.example.com",
    "medusa.example.com",
    "daedalus.example.com",
  ],
  scopes: [
    { id: 1, name: "profile.all_data", category: "Profile", permission: "All Data", },
    { id: 3, name: "contract.read_only", category: "Contracts", permission: "Read Only", },
  ],
};
*/

/**
 * Return the details of a single application.
 */
export async function getApplication(
  jwt: string,
  appId: string
): Promise<Application | null> {
  return new Promise(async (resolve, reject) => {
    const namespace = STORAGE_NAMESPACE
    const path = `/application/${appId}`
    const params = [namespace, path /*{ visibility: "private" }*/]

    // const getObject = await oortSend('kb_getObject', params, {
    //   jwt,
    //   cookie,
    // })

    const getObject = { result: { value: {} }, error: undefined }
    console.log(JSON.stringify(getObject, null, 2))

    // TODO handle these errors.
    if (getObject.error !== undefined) {
      reject(getObject)
    }

    resolve(getObject?.result?.value)
  })
}

// getApplicationListItems
// -----------------------------------------------------------------------------

/**
 * Return a list of the user's application.
 */
export async function getApplicationListItems(
  jwt: string
): Promise<Array<Application>> {
  return new Promise(async (resolve, reject) => {
    // Fetch the list of the user's application IDs.
    const appList = await fetchAppList(jwt)
    if (appList.errors !== undefined) {
      reject(appList)
    }

    // For each application ID, fetch the application data object.
    const requests = appList.map((appId) => {
      return getApplication(jwt, appId)
    })

    return Promise.all(requests).then((results) => {
      return results.map((getApp) => {
        return getApp?.result?.value
      })
    })
  })
}

// makeApplicationId
// -----------------------------------------------------------------------------

/**
 *
 */
export function makeApplicationId(): string {
  return crypto.randomUUID()
}

// makeApplicationKey
// -----------------------------------------------------------------------------

/**
 *
 */
function makeApplicationKey(appId: string): string {
  const id = appId.trim().toLowerCase()
  return `app/${id}`
}

// initApplication
// -----------------------------------------------------------------------------

/**
 * Initialize an empty application for the user to flesh out.
 */
export async function initApplication(session, appId: string) {
  return new Promise((resolve, reject) => {
    const appKey = makeApplicationKey(appId)
    const createdDate = new Date().toUTCString()

    const appDefaults = {
      published: false,
      secret: '',
      redirectURL: '',
      termsURL: '',
      websiteURL: '',
      mirrorURL: '',
      discordUser: '',
      mediumUser: '',
      twitterUser: '',
    }

    const appData = _.merge(appDefaults, {
      id: appId,
      createdDate,
    })

    session.set(appKey, appData)

    resolve(appData)
  })
}

// updateApplication
// -----------------------------------------------------------------------------

/**
 * Add fields to the partial definition of an application in the process
 * of being defined by the user. Each time this is called the application
 * with ID of appId is loaded from the session and the given fields
 * merged into before saving it back to the session.
 */
export async function updateApplication(session, appId: string, fields) {
  return new Promise(async (resolve, reject) => {
    const appKey = makeApplicationKey(appId)

    if (!session.has(appKey)) {
      const message = `missing app from session: ${appKey}`
      reject({ error: message })
    }
    const app = (await session.get(appKey)) || {}

    const updated = _.merge(app, fields)
    session.set(appKey, updated)

    resolve(updated)
  })
}

// cleanApplication
// -----------------------------------------------------------------------------

/**
 * Remove the application definition from session state.
 */
export async function cleanApplication(session, appId: string) {
  const appKey = makeApplicationKey(appId)
  if (session.has(appKey)) {
    session.unset(appKey)
  }
}

// fetchAppList
// -----------------------------------------------------------------------------

/**
 * Return a list of application IDs for a user.
 */
export async function fetchAppList(jwt: string): Promise<Array<string>> {
  return new Promise(async (resolve, reject) => {
    // The path to the list of the user's applications.
    const path = `/apps`
    // Storage write parameters: namespace, path, value.
    const params = [STORAGE_NAMESPACE, path]
    // Use the supplied JWT to authenticate to the service.
    const options = { jwt }

    // Write application data to storage service.
    const getObject = await oortSend('kb_getObject', params, options)
    if (getObject.error !== undefined) {
      reject(getObject)
    }

    resolve(getObject?.result?.value)
  })
}

// storeAppList
// -----------------------------------------------------------------------------

// TODO define application ID type.
type ApplicationList = Array<string>

export async function storeAppList(
  jwt: string,
  appList: ApplicationList
): Promise {
  return new Promise(async (resolve, reject) => {
    // The path to the list of the user's applications.
    const path = `/apps`
    // Options for the RPC call.
    const rpcOptions = {
      // Data storage object visibility.
      visibility: 'private',
    }
    // Storage write parameters: namespace, path, value.
    const params = [STORAGE_NAMESPACE, path, appList, rpcOptions]

    // Use the supplied JWT to authenticate to the service.
    const options = {
      jwt,
    }

    // Write application data to storage service.
    const putObject = await oortSend('kb_putObject', params, options)
    if (putObject.error !== undefined) {
      reject(putObject)
    }

    resolve(putObject)
  })
}

// createApplication
// -----------------------------------------------------------------------------

/**
 * Create an application.
 */
export async function createApplication(
  jwt: string,
  app: Pick<Application>
): Promise<Application> {
  return new Promise(async (resolve, reject) => {
    // This stored path uniquely identifies an application.
    const path = `/application/${app.id}`
    // Options for the RPC call.
    const rpcOptions = {
      // Data storage object visibility.
      visibility: 'private',
    }
    // Storage write parameters: namespace, path, value.
    const params = [STORAGE_NAMESPACE, path, app, rpcOptions]

    // Use the supplied JWT to authenticate to the service.
    const options = {
      jwt,
    }

    // Write application data to storage service.
    const result = await oortSend('kb_putObject', params, options)
    if (result.error !== undefined) {
      reject(result)
    }

    // Application write succeeded, fetch list of applications and add
    // this app ID to the list.
    let appList = (await fetchAppList(jwt)) || []
    // TODO handle rejected promise
    appList = _.filter(_.uniq(_.concat(appList, app.id)), (x) => {
      return !_.isUndefined(x) && !_.isNull(x)
    })
    console.log(appList)

    // Update the list of the user's applications.
    const storeResult = await storeAppList(jwt, appList)
    console.log(storeResult)

    resolve(storeResult)
  })
}

// deleteApplication
// -----------------------------------------------------------------------------

/**
 * Delete an application.
 */
export async function deleteApplication({
  jwt,
  appId,
}: Pick<Application, 'id' | 'appId'>) {
  return new Promise((resolve, reject) => {
    // TODO delete application.
    resolve(undefined)
  })
}
