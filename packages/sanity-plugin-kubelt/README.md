# sanity-plugin-kubelt

![Build](https://img.shields.io/github/checks-status/kubelt/kubelt/main)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)
![Status badge](https://img.shields.io/badge/Version-pre%20alpha-orange.svg)

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
bb run build:plugin:sanity
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
