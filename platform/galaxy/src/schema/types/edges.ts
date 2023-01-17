export default /* GraphQL */ `
  type Node {
    id: String!
    urn: String!
    nid: String!
    nss: String!
    fragment: String
    qc: JSON
    rc: JSON
  }

  type Edge {
    src: Node!
    dst: Node!
    tag: String!
    perms: [String]
  }
`
