#!/bin/bash

dev_url="https://icons-dev.kubelt.com"
next_url="https://icons-next.kubelt.com"
prod_url="https://icons.kubelt.com"

url="${dev_url}"

# We can associate an arbitrary map of metadata with the uploaded image.
image_metadata='{}'

curl -X POST -H "Content-Type: application/json" -d "${image_metadata}" "${url}"
