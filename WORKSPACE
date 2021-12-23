# WORKSPACE

workspace(
    name = "kubelt",
    # Map the @npm bazel workspace to the node_modules directory. This
    # lets Bazel use the same node_modules directory as other local
    # tooling.
    managed_directories = {
        "@npm": ["node_modules"],
    },
)

# Rules
# ------------------------------------------------------------------------------

# Bazel-provided rules
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# Local rules
load("//bzl:bazel_deps.bzl", "fetch_tool_dependencies")

# Tool Dependencies
# ------------------------------------------------------------------------------

# Use a local method to return the list of tool dependencies.
fetch_tool_dependencies()

# INITIALIZATION
# ------------------------------------------------------------------------------

#
# Skylib
#

load("@bazel_skylib//:workspace.bzl", "bazel_skylib_workspace")

bazel_skylib_workspace()

# NodeJS
#
# Rules to build and test code that targets a JavaScript runtime,
# including NodeJS and browsers.
#
# https://bazelbuild.github.io/rules_nodejs/

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "npm_install")

# NB: there are a number of additional custom rules that more tightly
# integrate specific JS tooling options with Bazel, e.g. Jasmine,
# Cyrpress, TypeScript. Further rules for not yet supported tools will
# not be officially added; custom rules should be developed and hosted
# locally.
#
# Examples of custom rules for the ambitious:
# https://bazelbuild.github.io/rules_nodejs/examples.html

node_repositories(
    node_version = "16.13.1",
    yarn_version = "1.22.17",
    package_json = [
        "//cli:package.json",
    ],
)

# TODO custom bazel rules for driving shadow-cljs
