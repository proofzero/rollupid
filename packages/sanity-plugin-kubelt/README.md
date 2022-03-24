# sanity-plugin-kubelt

## Installation

1. Link plugin;
2. Build plugin;
3. Link Sanity Studio to plugin;
4. 🚀.

### 1. Link plugin

#### Link

Inside `/kubelt/packages/sanity-plugin-kubelt`

```
npm link
```

### 2. Build plugin

Inside `/kubelt`

```
bb run build:plugin:sanity:release
```

### 3. Link Sanity Studio to plugin

Inside the `sanity-studio` solution

```
npm link sanity-plugin-kubelt
```

#### Start

```
sanity start
```
