# Guide: Setting Up the Development Environment for RollupID (Yarn Workspace Monorepo Setup)

This guide will help you set up the development environment for RollupID using the provided README files in the [RollupID repository](https://github.com/proofzero/rollupid). The RollupID project uses a Yarn Workspace monorepo setup, and each project within the monorepo has its own short guide to get started.

## Clone the repository

First, clone the repository using the following command:

```bash
git clone https://github.com/proofzero/rollupid.git
```

## Install dependencies

Navigate to the root directory of the cloned repository and install the required dependencies using Yarn:

```bash
cd rollupid
yarn
```

## Configure environment variables

Many projects in the repository have a .dev.vars.example file. Copy this file to a new file named .dev.vars and update the environment variables as required. Some projects may require you to obtain API keys and app keys.

For example, in the Console app:

```bash
cd apps/console
cp .dev.vars.example .dev.vars
```

Update the .dev.vars file with the required API keys and app keys. You'll need a Cloudflare account and recommend setting up a Github App for SSO flow.

## Optional: Nix

Although not required, using Nix can be useful for the development environment. Nix shell scripts are available at the root, apps, and platform directories. To use Nix, install it on your system and enter the Nix shell using the following command:

```bash
nix-shell
```

## Setup the Edges DB

1. Run `cd platform/edges`
2. Run `yarn db:execute` to create the database.

## Running the frontend applications

To run all frontend applications simultaneously, navigate to the `apps` directory and use the following command:

```bash
cd apps
yarn start
```

This command will start all frontend services simultaneously.

## Running the backend services

To run all backend services simultaneously, navigate to the `platform` directory and use the following command:

```bash
cd platform
yarn dev
```

This command will start all backend services simultaneously.

## Packages

The packages directory contains dependencies for the projects within the monorepo. These dependencies are shared among the projects to ensure consistency and reduce duplication.

### Adding new dependencies

To add new dependencies to a specific project within the monorepo, navigate to the project directory and use Yarn to add the dependency:

```bash
cd <project-directory>
yarn add <dependency-name>
```

## Testing

### Setup

Run `npx playwright install` to install the browsers you want to test with.

### Apps E2E Testing

In the apps directory of the monorepo, each project is setup with Playwright e2e test framework. To run the tests simply run `yarn playwright test` in the app directory you want to test.

Make sure you are running the apps when running the tests locally.

### Testing Guidelines

Currently we run E2E tests in the Console and Passports apps found in the apps directory. In these directories you will find a single test spec file that runs a sequence of tests in order using a single browser context using a set of authentication credentials (see below). This is to ensure that the tests are run in a clean state and that the tests are not dependent on each other.

In the future we will be able to run tests in parallel using multiple browser contexts and multiple authentication credentials ([see issue](https://github.com/proofzero/rollupid/issues/2123)).

Avoid testing minor UI changes like copy and images and instead focus on flows and functionality.

If tests fail after PR is landed please open an issue and assign it to the author of the PR.

#### Console

In console we use the following accounts to test with:

- Github
- Microsoft

#### Passport

In passports we use the following accounts to test with:

- Twitter
- Google
- Discord
- Apple

## Contributing

When working on multiple projects within the monorepo, ensure that you follow the same code style, contribution guidelines, and testing procedures for each project. This will help maintain consistency and quality across the entire codebase.

Remember to thoroughly test your code and update any relevant documentation or tests before submitting your changes. Create a pull request with a clear description of your changes and reference any related issues or discussions.

## Community

Join us on [Discord](https://discord.gg/rollupid) and [Twitter](https://twitter.com/rollupid) to discuss RollupID and learn more about the project.
