// @kubelt/graph:util.ts

/**
 * Platform utilities for creating, removing, and listing various kinds
 * of platform links without worrying about the details of making calls
 * to the "edges" service.
 */

import type { AccountURN } from '@kubelt/urns/account'
import type { AddressURN } from '@kubelt/urns/address'
import type { ApplicationURN } from '@kubelt/urns/application'

import type { Edge, EdgeQuery } from './types'

import { EdgeDirection, EdgesOptions, NodeFilter } from './types'

import { EDGE_ADDRESS, EDGE_APPLICATION } from './edges'

import { Address } from '@kubelt/types'

import * as graph from './index'

// Account <=> Address
// -----------------------------------------------------------------------------

/**
 * Create the link between an account node and the address node
 * representing an address that the account owns.
 */
export async function linkAccountAddress(
  edges: Fetcher,
  account: AccountURN,
  address: AddressURN
): ReturnType<typeof graph.link> {
  const src = account
  const dst = address
  const tag = EDGE_ADDRESS

  return graph.link(edges, src, dst, tag)
}

/**
 * Remove the link between an account node and the address node
 * representing an address that the account owns.
 */
export async function unlinkAccountAddress(
  edges: Fetcher,
  account: AccountURN,
  address: AddressURN
): ReturnType<typeof graph.unlink> {
  const src = account
  const dst = address
  const tag = EDGE_ADDRESS

  return graph.unlink(edges, src, dst, tag)
}

// Account <=> Application
// -----------------------------------------------------------------------------

/**
 * Create the link between an account node and an application node that
 * the account owns.
 */
export async function linkAccountApp(
  edges: Fetcher,
  account: AccountURN,
  application: ApplicationURN
): ReturnType<typeof graph.link> {
  const src = account
  const dst = application
  const tag = EDGE_APPLICATION

  return graph.link(edges, src, dst, tag)
}

/**
 * Remove the link between an account node and the application node that
 * the account owns.
 */
export async function unlinkAccountApp(
  edges: Fetcher,
  account: AccountURN,
  application: ApplicationURN
): ReturnType<typeof graph.unlink> {
  const src = account
  const dst = application
  const tag = EDGE_APPLICATION

  return graph.unlink(edges, src, dst, tag)
}

// listAddresses()
// -----------------------------------------------------------------------------

/**
 * Return the list of addresses belonging to an account, identified by
 * its canonical URN.
 */
export async function listAddresses(
  edges: Fetcher,
  account: AccountURN,
  addrType?: Address.CryptoAddressType
): ReturnType<typeof graph.edges> {
  // Construct the query for edges linking an account node and address
  // node (of optional address type).
  const query: EdgeQuery = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    id: account,
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,
    // Account -> Address edges indicate ownership.
    dir: EdgeDirection.Outgoing,
  }
  // If the node type was specified as a parameter, we'll filter our
  // results using a node filter attached to the destination node of our
  // query.
  if (addrType !== undefined) {
    query.dst = {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: addrType,
      },
    } as NodeFilter
  }
  const opt: EdgesOptions = {
    // TODO pagination?
    // TODO cache control?
    // TODO access control?
  }

  // Request the list of edges that originate at the account and have
  // the given type.
  return graph.edges(edges, query, opt)
}

// listApplications()
// -----------------------------------------------------------------------------

/**
 * Return a list of edges linking an account node and any Starbase
 * applications it is connected to.
 */
export async function listApplications(
  edges: Fetcher,
  account: AccountURN
): ReturnType<typeof graph.edges> {
  // When an account owns an application, there is an edge *from* the
  // account node *to* the app node (direction = outgoing), with edge
  // type tag defined by EDGE_APPLICATION.
  const id = account
  const tag = EDGE_APPLICATION
  const dir = EdgeDirection.Outgoing

  const query: EdgeQuery = { id, tag, dir }

  return graph.edges(edges, query)
}
