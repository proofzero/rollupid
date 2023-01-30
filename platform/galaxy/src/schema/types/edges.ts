export default /* GraphQL */ `
  type Node {
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
  }

  input NodeInput {
    urn: String!
    nid: String!
    nss: String!
    fragment: String
    qc: JSON
    rc: JSON
  }
`
