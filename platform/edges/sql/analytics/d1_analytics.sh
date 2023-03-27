#!/bin/bash
for filename in ./*.sql; do
    for ((i=0; i<=3; i++)); do
      npx wrangler d1 execute edges-current --file "$filename" --env current
    done
done