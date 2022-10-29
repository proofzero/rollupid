import { error } from 'itty-router-extras'
import { OpenrpcDocument, Methods } from '@open-rpc/meta-schema'

import {
  JSONRPCCallbackTypePlain,
  JSONRPCVersionTwoRequest,
  Method,
  Server,
} from 'jayson/promise'

import { MethodMap } from '../../jsonrpc'

import { Packages } from '../../packages'

const getOpenRPCDocument = (methods: Methods): OpenrpcDocument => ({
  openrpc: '1.2.6',
  info: {
    title: 'Kubelt Core',
    version: '0.0.0',
  },
  methods,
})

export default (packages: Packages) => {
  const methodMap: MethodMap = {}
  const methodObjects: Methods = []

  Object.values(packages).map((instance) => {
    Object.assign(methodMap, instance.getMethodMap())
    methodObjects.push(...instance.getMethodObjects())
  })

  const server = new Server(methodMap, { useContext: true })
  server['_methods']['rpc.discover'] = new Method(
    (
      args: JSONRPCVersionTwoRequest,
      callback: JSONRPCCallbackTypePlain
    ): void => {
      try {
        callback(null, getOpenRPCDocument(methodObjects))
      } catch (err) {
        console.error(err)
        callback(null, error(500))
      }
    }
  )
  return server
}
