// @kubelt/graph:db/index.ts

import * as urns from 'urns'

import { FileDataSource } from './data-source'
import { Edge } from './entity/Edge'
import { Node } from './entity/Node'
import { Permission } from './entity/Permission'

import * as graph from '@kubelt/graph'
import * as security from '@kubelt/security'
import * as scopes from '@kubelt/security/scopes'

// SQLite3 (Local File)
// -----------------------------------------------------------------------------
// We are currently using this set up our database schema / fixture data.

FileDataSource.initialize()
  .then(async () => {
    // Define a test scope needed to traverse an edge.
    //
    // NB: if we end up making something like this official it would be
    // defined in the @kubelt/security/scopes module.
    const dbRead = security.scope('scope.kubelt.com/db/reader')

    const nodeRepo = FileDataSource.getRepository(Node)
    const permRepo = FileDataSource.getRepository(Permission)

    let dbReadPerm = await permRepo.findOneBy({
      name: scopes.asString(dbRead),
    })
    if (dbReadPerm === null) {
      console.log('Missing db reader permission, adding...')
      dbReadPerm = new Permission()
      dbReadPerm.name = scopes.asString(dbRead)
      await FileDataSource.manager.save(dbReadPerm)
    }
    console.log('Saved a new permission with id: ' + dbReadPerm.id)

    // Find the src node if already present.
    const srcURN = graph.node('example', 'source')
    let src = await nodeRepo.findOneBy({ urn: srcURN })
    if (src) {
      console.log(`Found existing source node with urn: ${src.urn}`)
    } else {
      const parsed = urns.parseURN(srcURN)
      const node = new Node()
      node.urn = srcURN
      node.nid = parsed.nid
      node.nss = parsed.nss
      node.fragment = parsed.fragment || ''
      // TODO rc, qc
      await FileDataSource.manager.save(node)
      console.log(`Saved a new node with urn: ${node.urn}`)
      src = node
    }

    const dstURN = graph.node('example', 'destination')
    let dst = await nodeRepo.findOneBy({ urn: dstURN })
    if (dst) {
      console.log(`Found existing dest node with urn: ${dst.urn}`)
    } else {
      const parsed = urns.parseURN(dstURN)
      const node = new Node()
      node.urn = dstURN
      node.nid = parsed.nid
      node.nss = parsed.nss
      node.fragment = parsed.fragment || ''
      // TODO rc, qc
      await FileDataSource.manager.save(node)
      console.log(`Saved a new node with urn: ${node.urn}`)
      dst = node
    }

    console.log('Inserting a new edge into the database...')
    const edge = new Edge()
    edge.src = src
    edge.dst = dst
    edge.tag = graph.edge('owns')
    edge.permissions = [dbReadPerm]

    await FileDataSource.manager.upsert(Edge, edge, ['src', 'dst', 'tag'])
    console.log(`Saved edge: ${JSON.stringify(edge, null, 2)}`)

    console.log('Loading nodes from the database...')
    const nodes = await FileDataSource.getRepository(Node).find()
    console.log('Loaded nodes: ', JSON.stringify(nodes, null, 2))

    console.log('Loading edges from the database...')
    const edges = await FileDataSource.getRepository(Edge).find({
      relations: {
        permissions: true,
      },
    })
    console.log('Loaded edges: ', JSON.stringify(edges, null, 2))
  })
  .catch((error: unknown) => {
    console.log(error)
  })

// D1 (Local)
// -----------------------------------------------------------------------------
// TODO

// D1 (Remote)
// -----------------------------------------------------------------------------
// TODO
