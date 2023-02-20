export default /* GraphQL */ `
  type Node {
    baseUrn: String!
    qc: JSON
    rc: JSON
  }

  type Edge {
    src: Node!
    dst: Node!
    tag: String!
  }

  input NodeInput {
    baseUrn: String!
    qc: JSON
    rc: JSON
  }
`
