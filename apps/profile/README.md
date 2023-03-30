# Profile App

## Overview

The profile app is a sandbox app for testing and developing the Rollup platform. The app is modeled after LinkTree and allows users to create a profile with links to their connected accounts.

## Setup

### Local Env

1. Copy `.dev.vars.example` to `.dev.vars` and fill in the values.
2. Login to Console (https://localhost:10003) and create an app with the following settings:
   - Name: `Profile`
   - Redirect URI: `http://localhost:10001/auth/callback`
   <!-- - Scopes: `openid profile email` -->
3. Copy the client id and client secret into the `.dev.vars` file.
