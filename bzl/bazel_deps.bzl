# bzl/bazel_deps.bzl
#
# Third-party dependencies fetched by Bazel. Unlike WORKSPACE, the
# content of this file is unordered. We keep them separate to make the
# WORKSPACE file more maintainable.

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Install the nodejs "bootstrap" package. This provides the basic
# tools for running and packaging nodejs programs in Bazel.
def fetch_nodejs():
    http_archive(
        name = "build_bazel_rules_nodejs",
        sha256 = "f0f76a06fd6c10e8fb9a6cb9389fa7d5816dbecd9b1685063f89fb20dc6822f3",
        urls = [
            "https://github.com/bazelbuild/rules_nodejs/releases/download/4.5.1/rules_nodejs-4.5.1.tar.gz",
        ],
    )


# Install Skylib, a library of common useful functions and rules for Bazel.
def fetch_skylib():
    http_archive(
        name = "bazel_skylib",
        sha256 = "c6966ec828da198c5d9adbaa94c05e3a1c7f21bd012a0b29ba8ddbccb2c93b0d",
        urls = [
            "https://github.com/bazelbuild/bazel-skylib/releases/download/1.1.1/bazel-skylib-1.1.1.tar.gz",
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-skylib/releases/download/1.1.1/bazel-skylib-1.1.1.tar.gz",
        ],
    )

# Install Python.
def fetch_python():
    # Latest @ 2021-06-23
    rules_python_version = "740825b7f74930c62f44af95c9a4c1bd428d2c53"
    rules_python_sha256 = "09a3c4791c61b62c2cbc5b2cbea4ccc32487b38c7a2cc8f87a794d7a659cc742"
    strip_prefix = "rules_python-{}".format(rules_python_version)
    url = "https://github.com/bazelbuild/rules_python/archive/{}.zip".format(
        rules_python_version,
    )
    http_archive(
        name = "rules_python",
        sha256 = rules_python_sha256,
        strip_prefix = strip_prefix,
        url = url,
    )

def fetch_tool_dependencies():
    fetch_skylib()
    fetch_python()
    fetch_nodejs()
