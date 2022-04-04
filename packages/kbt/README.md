# kbt

![Build](https://img.shields.io/github/checks-status/kubelt/kubelt/main)
![License](https://img.shields.io/github/license/kubelt/kubelt)
[![Discord](https://img.shields.io/discord/790660849471062046?label=Discord)](https://discord.gg/m8NbsgByA9)
![Status badge](https://img.shields.io/badge/Version-pre%20alpha-orange.svg)

## development

Install environment (i.e. `java`), e.g., on Ubuntu:

```
$ sudo apt install openjdk-17-jre-headless
```

Install dependencies:

```
$ npm i
```

Build the CLI:

```
$ npx shadow-cljs compile cli
```

Build the tests:

```
$ npx shadow-cljs compile test
```

The tests are configured to run automatically after building successfully, but to run them manually:

```
$ node target/cli-test.js
```

Link the CLI locally:

```
$ npm link
```

Install the CLI:

```
$ npm i -g .
```

Run the CLI:

```
$ kbt
```
