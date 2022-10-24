import { AddressInfo } from 'net'
import { Miniflare } from 'miniflare'

import tap from 'tap'

import jayson from 'jayson/promise'
import { Wallet } from '@ethersproject/wallet'

import jsonrpc from './jsonrpc'
import auth from './auth'
import management from './management'
import storage from './storage'

const wallet = Wallet.createRandom()

const clientDefaultOptions = {
  headers: {},
}

const miniflare = new Miniflare({
  port: 0,
  envPath: true,
  packagePath: true,
  scriptPath: 'dist/shim.mjs',
  wranglerConfigEnv: 'test',
  wranglerConfigPath: true,
})

tap.test('core', async (t) => {
  const server = await miniflare.startServer()

  t.context.getClient = (options = clientDefaultOptions) => {
    const { port } = server.address() as AddressInfo
    const path = `/jsonrpc`
    const headers = {
      'KBT-Core-Address': wallet.address,
    }
    Object.assign(headers, options.headers)
    return jayson.Client.http({ port, path, headers })
  }

  t.context.wallet = wallet

  await jsonrpc(t)
  await auth(t)
  await management(t)
  await storage(t)

  server.close()
})
