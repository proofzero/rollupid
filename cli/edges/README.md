# @kubelt/cli.edges

Define a CLI tool for interacting with the edges service.

## build

```shell
$ npx yarn run build
```

## run

To add an edge:

```shell
$ node dist/index.js edge:add --src urn:example:src --dst urn:example:dst --tag urn:edge-tag:foo
```

To remove an edge (*wip*):

```shell
$ node dist/index.js edge:rm --src urn:example:src --dst urn:example:dst --tag urn:edge-tag:foo
```

To query for a set of edges (*wip*):

```shell
$ node dist/index.js edge:get ...
```

To query for a single node (*wip*):

```shell
$ node dist/index.js node:get ...
```

To query for the incoming edges of a node (*wip*):

```shell
$ node dist/index.js edge:in --node urn:example:src
```

To query for the outgoing edges of a node (*wip*):

```shell
$ node dist/index.js edge:out --node urn:example:src
```
