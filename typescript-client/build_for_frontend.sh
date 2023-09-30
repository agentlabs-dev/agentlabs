#!/bin/bash
set -e

npx --yes openapi-typescript-codegen \
  --input ../server/openapi.yaml \
  --output ./src \
  --useOptions \
  --useUnionTypes


cp client.ts src/
echo 'export { getToken } from "./client";' >> src/index.ts

rm -rf ../frontend/src/lib/services/gen-api
# important: gen-api folder must be in .gitignore since we don't want to commit it.
cp -R ./src ../frontend/src/lib/services/gen-api