# three-id

TODO

## development

TODO

### preliminaries

You will need to ensure you have several tools installed before beginning development:
- [java](https://www.oracle.com/java/technologies/downloads/) - the Java SE Development Kit (version `18-ea`)
- [node](https://nodejs.org/en/) - a JavaScript runtime (version `lts/gallium`)
- [babashka](https://babashka.org/) - build and deployment task management (version `0.8.0` or greater)

Once these are installed and available on your path, the installation of other dependencies is handled using these tools.

To be able to perform deployments to your own remote, personal developer environment you'll need to have a local copy of the `deploy.edn` configuration file. Building and running on your `localhost` should work without this file however.

Initialize the node environment by installing the required tools and dependencies:
```shell
$ npm init
```

Check that [shadow-cljs](https://github.com/thheller/shadow-cljs) is installed and working:
```shell
$ npx shadow-cljs --cli-info
```

Check that [wrangler](https://github.com/cloudflare/wrangler) is installed and working:
```shell
$ npx wrangler whoami
```

If you are doing any non-local development and the output of this command reports that you are not logged in, run this command and authenticate in order to be able to deploy software:
```shell
$ npx wrangler login
```
