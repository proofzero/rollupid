# 3iD

3iD is an opt-in service that provides users a super-charged "gravatar"-like service that gives users control and privacy over their application data and p2p messaging. This repository holds an Expo application rendering to React Native Web, configured to communicate with a Kubelt-specific RPC provider module powered by Kubelt private account cores. It works in combination with Starship.

## Development

There are two solutions involved in the building / running / deploying process:
1. Kubelt SDK
2. Expo RNW App

*Without additional specification, commands and paths in this README are to be interpreted in the context of the `./3iD` folder*

### Preliminaries

You will need to ensure you have several tools installed before beginning development:

- [java](https://www.oracle.com/java/technologies/downloads/) - the Java SE Development Kit (version `18-ea`)
- [node](https://nodejs.org/en/) - a JavaScript runtime (version `lts/gallium`)
- [babashka](https://babashka.org/) - build and deployment task management (version `0.8.0` or greater)

Once these are installed and available on your path, the installation of other dependencies is handled using these tools.

### Kubelt SDK

To set up your environment for building the Kubelt SDK, follow [Kubelt Monorepo README](https://github.com/kubelt/kubelt) and [Kubelt Developer Documentation](https://developers.kubelt.com).

3iD requires the development version of the Kubelt SDK `sdk-web` release target. This can be achieved by running the sdk-web develop command in the root of the monorepo (`../`): `bb build:sdk-web:develop`.

Successfully running this command will produce an artifact in the `../packages/sdk-web` folder of the monorepo. 

### Expo RN

The build `sdk-web` from the previous step needs to be referenced inside the 3iD Expo application. If you're developing within the monorepo, this should be the case out of the box; however, if you have a custom setup, you should take a look at `./packages.json` and make sure that the `@kubelt/sdk-web` package is properly referenced:

`"@kubelt/sdk-web": "file:../packages/sdk-web"` *<- should point to the build output of previous task*

With `node` and `npm` installed, we can run `npm install` to bring in all the packages. While that's happening, you can take a look at the `./.env.example` file provided to asses what values you might need to provide and can start filling them up in your own `.env` file (this can also be generated via a `bb` task, described in the Deployment section).

## Developing

While developing, your main concern will be running `npm run web` to get the development web server running and locally serve the application. On a successful run of this command, you should also make sure to update `app.config.ts` with different slugs and values if need be.

## Testing

With the development server running, the following command should run the test suite:

`npm run test:synpress:run`

TODO

## Deployment

To perform deployments to your own remote, personal developer environment, you'll need to have a local copy of the `deploy.edn` configuration file. However, building and running on your `localhost` should work without this file.

### Preliminaries

Check that [wrangler](https://github.com/cloudflare/wrangler) is installed and working:

```shell
$ npx wrangler whoami
```

If you are doing any non-local development and the output of this command reports that you are not logged in, run this command and authenticate to be able to deploy software:

```shell
$ npx wrangler login
```

### Generate .env file for environment

`bb dot:env --deploy-env <env_name>`

### Deploy app

`bb deploy:app --deploy-env <env_name>`

### Publish site

#### Linux

`bb publish:site --deploy-env <env-name>`

#### Windows

In case the `bb publish:site` task doesn't work on your windows configuration,
deployment can be done through `wrangler` inside the `./worker` folder.

`wrangler publish -c .\wrangler.toml --env <env_name>`
