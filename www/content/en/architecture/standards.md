---
title: "Engineering Standards"
description: "An index of Kubelt engineering standards with relevant links where applicable."
lead: "An index of Kubelt engineering standards with relevant links where applicable."
date: 2022-07-07T20:23:21-04:00
lastmod: 2022-07-07T20:23:21-04:00
images: []
menu:
  docs:
    parent: ""
weight: 999
toc: true
---

## Introduction

This document is an index of Kubelt's engineering standards. It is intended to provide a linkable set of definitions of good software engineering practices, with pointers to more information where warranted.

## Build Output and Configuration

1. Builds should complete with neither warnings nor errors.
1. Build systems should have all settings related to emitting warnings set to maximum. We want to report all possible warnings.
1. Build systems should be configured to treat warnings as errors. If this is not possible then warnings should be considered errors and fixed.

As a general principle we want to eliminate implicit behaviour to the fullest possible extent. If something works despite a warning, it doesn't really work -- therefore the warning is an error, and builds should be error-free.

Another general principle here is reducing notification fatigue and, analogously, [Broken Windows Theory](https://en.wikipedia.org/wiki/Broken_windows_theory).

## Console Output

The production build of an application should run with no (non-functional) console output.

Browser apps should run with no console output.

Command-line tool outputs should be directed to appropriate streams (stdout, stderr) and formatted for machine readability over human readability.

## Platform Versions

Use the current LTS version of any piece of platform technology.

### Current Node and NPM Version

Gallium

## Dependency Management

Use the latest versions of all dependencies and update them regularly. See section on [Node & NPM](#node--npm) for notable exceptions.

### Node & NPM

Node dependencies management is difficult because of nesting. This means effort needs to be expended to update intermediate dependencies. Most projects simply accept `npm i` warning output, including security vulnerabilities.
