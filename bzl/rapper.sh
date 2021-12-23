#!/bin/bash

# bzl/rapper.sh
#
# Convert an RDF file from one supported format to another.

input_format="${1}"
input_file="${2}"

output_format="${3}"
output_file="${4}"

rapper --quiet \
       --input "${input_format}" \
       --output "${output_format}" \
       "${input_file}" \
       > \
       "${output_file}"
