# @kubelt/platform.edges

Define a D1 database for storage and retrieval of graph edges. This database is interacted with using the `@kubelt/graph` package, and requires that it be added to a platform service as a binding that is passed along to the library methods.

NB: the worker defined here is for convenience in testing, it's *not* a production service.
