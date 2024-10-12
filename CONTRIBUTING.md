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

Run `npx playwright install` to install the browsers you want to test with. Also setup the test credentials in the .env.example files in console and passport.

### Apps E2E Testing

In the apps directory of the monorepo, each project is setup with Playwright e2e test framework. To run the tests simply run `yarn playwright test` in the app directory you want to test.

Make sure you are running the apps when running the tests locally.

### Testing Guidelines

Currently we run E2E tests in the Console and Passports apps found in the apps directory. In these directories you will find a single test spec file that runs a sequence of tests in order using a single browser context using a set of authentication credentials (see below). This is to ensure that the tests are run in a clean state and that the tests are not dependent on each other.

In the future we will be able to run tests in parallel using multiple browser contexts and multiple authentication credentials ([see issue](https://github.com/proofzero/rollupid/issues/2123)).

Avoid testing minor UI changes like copy and images and instead focus on flows and functionality.

If tests fail after PR is landed please open an issue and assign it to the author of the PR.

#### Accounts

The current testing strategy in with accounts is to use email. This is because SSO providers have bespoke MFA settings that we can't properly handle with e2e tests (for now).

To handle email OTPs we use the `platform/test` worker to recive emails and maket them available via API. This test worker is only available locally and in the dev environment and only certain emails are routed to this service. This email is stored as a secret in `INTERNAL_EMAIL_TEST_USERNAME` and tests can increment email addresses the by replacing the number in the email like this: `const email = process.env.INTERNAL_EMAIL_TEST_USERNAME?.replace(/(\d)/, '1')`

The test worker is also protected by an API Key stored in `SECRET_TEST_API_TOKEN` and the URL for the service is stored in `INTERNAL_PLAYWRIGHT_TEST_URL`

All these env vars can be set in the projects `.env` file.

## Contributing

When working on multiple projects within the monorepo, ensure that you follow the same code style, contribution guidelines, and testing procedures for each project. This will help maintain consistency and quality across the entire codebase.

Remember to thoroughly test your code and update any relevant documentation or tests before submitting your changes. Create a pull request with a clear description of your changes and reference any related issues or discussions.

## Community

Join us on [Discord](https://discord.gg/rollupid) and [X (formerly Twitter)](https://x.com/rollupid) to discuss RollupID and learn more about the project.
