#!/bin/bash

dev_url="https://icons-dev.rollup.id"
next_url="https://icons-next.rollup.id"
prod_url="https://icons.rollup.id"

url="${dev_url}"

# We can associate an arbitrary map of metadata with the uploaded image.
image_metadata='{}'

curl -X POST -H "Content-Type: application/json" -d "${image_metadata}" "${url}"
