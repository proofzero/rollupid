# sanity-plugin-kubelt

## Installation

1. Link and build @kubelt/sdk-web;
2. Link the sanity-kubelt-plugin and build / watch it;
3. Link a local Sanity Studio instance to the plugin & start it.

### 1. Link and build @kubelt/sdk-web

#### Build CJS packages

Inside the `kubelt` solution

```
bb run build:sdk:develop
```

```
bb run build:web:develop
```

#### Build NPM packages

Inside the `kubelt/packages/sdk-js`

```
npm run build
```

Inside the `kubelt/packages/sdk-web`

```
npm run build
```

#### Link

Inside the `kubelt/packages/sdk-web`

```
npm link
```

Inside the `sanity-plugin-kubelt`

```
npm link @kubelt/sdk-web
```

### 2. Link the sanity-kubelt-plugin and build / watch it

#### Link

Inside the `sanity-plugin-kubelt`

```
npm link
```

#### Build

If live developing you can skip this build step

Inside the `sanity-plugin-kubelt`

```
npm run build
```

#### Watch

If live developing, start a watch task for your plugin

Inside the `sanity-plugin-kubelt`

```
npm run watch
```

### 3. Link a local Sanity Studio instance to the plugin & start it

#### Link

Inside the `sanity-studio` solution

```
npm link sanity-plugin-kubelt
```

#### Start

```
sanity start
```

## License

Apache License 2.0 © Kubelt Inc.
See LICENSE
