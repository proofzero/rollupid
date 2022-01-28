# kbt

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
