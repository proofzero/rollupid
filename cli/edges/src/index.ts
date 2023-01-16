// @kubelt/cli.edges:src/index.ts

/**
 * A testing utility for the edges service.
 *
 * Execute with:
 * $ npx yarn run cli:graph <...>
 */

// yargs setup
// -----------------------------------------------------------------------------

import type { Argv, Arguments, ArgumentsCamelCase, CommandModule } from 'yargs'
import { hideBin } from 'yargs/helpers'
import _yargs from 'yargs/yargs'
const yargs = _yargs(hideBin(process.argv))

// imports
// -----------------------------------------------------------------------------

import * as net from 'net'
import fetch from 'node-fetch'
import { parseURN, unparseURN } from 'urns'

import type { AnyURN } from '@kubelt/urns'
import type { EdgeURN } from '@kubelt/urns/edge'

import { EdgeSpace } from '@kubelt/urns/edge'

import { EdgeDirection } from '@kubelt/types/graph'

import createEdgesClient from '@kubelt/platform-clients/edges'

// fetcher
// -----------------------------------------------------------------------------

function makeFetcher(
  port: number,
): ReturnType<typeof createEdgesClient> {
  const fetcher: Fetcher = {
    fetch: async (
      // RequestInfo = Request | string | URL
      input: RequestInfo,
      init?: RequestInit<RequestInitCfProperties>
    ): Promise<Response> => {
      console.log(`request: ${input}`)
      console.log(`options: ${JSON.stringify(init, null, 2)}`)
      let reqInfo: RequestInfo = input
      // The platform client doesn't specify a port, so we need to
      // inject it.
      if (typeof input === 'string') {
        const url = new URL(input)
        url.port = `${port}`
        reqInfo = url
      }
      const response = (await fetch(reqInfo, init)) as unknown
      return response as Response
    },
    connect: (address: string, options?: SocketOptions): Socket => {
      // Missing .close()
      const s = new net.Socket() as unknown
      return s as Socket
    },
  }
  return createEdgesClient(fetcher)
}

// commands
// -----------------------------------------------------------------------------

// addEdge
// -----------------------------------------------------------------------------
// Add an edge.

interface AddEdgeArgs {
  src: string
  dst: string
  tag: string
}

const addEdge = {
  command: 'edge:add',
  describe: 'add an edge',
  builder: {
    src: {
      string: true,
      alias: 's',
      describe: 'the source node URN',
      demandOption: true,
    },
    dst: {
      string: true,
      alias: 'd',
      describe: 'the destination node URN',
      demandOption: true,
    },
    tag: {
      string: true,
      alias: 't',
      describe: 'the edge type URN',
      demandOption: true,
    },
  },
  handler: async ({
    src,
    dst,
    tag,
  }: ArgumentsCamelCase<AddEdgeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const srcUrn = unparseURN(parseURN(src)) as AnyURN
    const dstUrn = unparseURN(parseURN(dst)) as AnyURN

    let edgeUrn
    if (EdgeSpace.is(tag)) {
      edgeUrn = tag as EdgeURN
    } else {
      throw new Error(`invalid tag: ${tag}`)
    }

    const response = await edgesClient.makeEdge.mutate({
      src: srcUrn,
      dst: dstUrn,
      tag: edgeUrn,
    })

    console.log(response)
  },
}

// removeEdge
// -----------------------------------------------------------------------------
// Remove an edge.

interface RemoveEdgeArgs {
  src: string
  dst: string
  tag: string
}

const removeEdge = {
  command: 'edge:rm',
  describe: 'remove an edge',
  builder: {
    src: {
      string: true,
      alias: 's',
      describe: 'the source node URN',
      demandOption: true,
    },
    dst: {
      string: true,
      alias: 'd',
      describe: 'the destination node URN',
      demandOption: true,
    },
    tag: {
      string: true,
      alias: 't',
      describe: 'the edge type URN',
      demandOption: true,
    },
  },
  handler: async ({
    src,
    dst,
    tag,
  }: ArgumentsCamelCase<RemoveEdgeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const srcUrn = unparseURN(parseURN(src)) as AnyURN
    const dstUrn = unparseURN(parseURN(dst)) as AnyURN

    let edgeUrn
    if (EdgeSpace.is(tag)) {
      edgeUrn = tag as EdgeURN
    } else {
      throw new Error(`invalid tag: ${tag}`)
    }

    const response = await edgesClient.removeEdge.mutate({
      src: srcUrn,
      dst: dstUrn,
      tag: edgeUrn,
    })

    console.log(response)
  },
}

// getEdges
// -----------------------------------------------------------------------------
// Get a collection of edges.

// TODO how do we get (and type) a map that collects all rc/qc params
// supplied on the CLI using yargs?
interface GetEdgeArgs {
  id: AnyURN
  tag?: EdgeURN
  dir?: EdgeDirection

  // node filter (src)
  srcId?: AnyURN
  srcFr?: string
  //srcQc?: ??
  //srcRc?: ??

  // node filter (dst)
  dstId?: AnyURN
  dstFr?: string
  //dstQc?: ??
  //dstRc?: ??
}

const getEdges = {
  command: 'edge:get',
  describe: 'get a collection of edges',
  builder: {},
  handler: async ({
    id,
    tag,
    dir,
    srcId,
    srcFr,
    dstId,
    dstFr,
  }: ArgumentsCamelCase<GetEdgeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const nodeUrn = unparseURN(parseURN(id)) as AnyURN

    // TODO flesh out with additional query params.
    const query = {
      id: nodeUrn,
    }

    const response = await edgesClient.getEdges.query({
      query,
    })

    console.log(response)
  },
}

// findNode
// -----------------------------------------------------------------------------
// Find a single node.
//
// NB: findNode method is not yet implemented in the service.

interface FindNodeArgs {
  node: AnyURN
}

const findNode = {
  command: 'node:get',
  describe: 'get a single nodes',
  builder: {
    node: {
      string: true,
      alias: 'n',
      describe: 'the node URN',
      demandOption: true,
    },
  },
  handler: async ({
    node,
  }: ArgumentsCamelCase<FindNodeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const nodeUrn = unparseURN(parseURN(node)) as AnyURN

    const response = await edgesClient.findNode.query({
      urn: nodeUrn,
    })

    console.log(response)
  },
}

// incomingEdges
// -----------------------------------------------------------------------------
// Return a list of edges that terminate at a node.
//
// NB: findNode method is not yet implemented in the service.

interface IncomingEdgesArgs {
  node: AnyURN
}

const incomingEdges = {
  command: 'edges:in',
  describe: 'return the edges that terminate at a node',
  builder: {
    node: {
      string: true,
      alias: 'n',
      describe: 'the node URN',
      demandOption: true,
    },
  },
  handler: async ({
    node
  }: ArgumentsCamelCase<FindNodeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const nodeUrn = unparseURN(parseURN(node)) as AnyURN

    const response = await edgesClient.findNode.query({
      urn: nodeUrn,
    })

    console.log(response)
  },
}

// outgoingEdges
// -----------------------------------------------------------------------------
// Return a list of edges that originate at a node.
//
// NB: findNode method is not yet implemented in the service.

interface OutgoingEdgesArgs {
  node: AnyURN
}

const outgoingEdges = {
  command: 'edges:out',
  describe: 'return the edges that originate at a node',
  builder: {
    node: {
      string: true,
      alias: 'n',
      describe: 'the node URN',
      demandOption: true,
    },
  },
  handler: async ({
    node,
  }: ArgumentsCamelCase<FindNodeArgs>): Promise<void> => {
    const edgesClient = makeFetcher(8686)
    const nodeUrn = unparseURN(parseURN(node)) as AnyURN

    const response = await edgesClient.findNode.query({
      urn: nodeUrn,
    })

    console.log(response)
  },
}

// root
// -----------------------------------------------------------------------------

yargs
  .scriptName(`graph`)
  .command(addEdge)
  .command(removeEdge)
  .command(getEdges)
  //.command(findNode)
  //.command(incomingEdges)
  //.command(outgoingEdges)
  .completion()
  .demandCommand()
  .recommendCommands()
  .strictCommands()
  .help().argv
