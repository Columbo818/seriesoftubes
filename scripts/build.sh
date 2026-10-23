#!/usr/bin/env bash
# Builds the deployable site into _site/: copies site/ and stamps the version
# (from package.json) and the build date into the pages that carry them.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${VERSION:-$(node -p "require('./package.json').version")}"
BUILD_DATE="${BUILD_DATE:-$(date -u +%Y-%m-%d)}"

rm -rf _site
cp -R site _site
for f in _site/index.html _site/sitemap.xml _site/llms.txt; do
  sed -i.bak -e "s/__VERSION__/${VERSION}/g" -e "s/__BUILD_DATE__/${BUILD_DATE}/g" "$f"
  rm -f "$f.bak"
done

if grep -rl "__VERSION__\|__BUILD_DATE__" _site >/dev/null; then
  echo "error: unreplaced placeholders left in _site" >&2
  exit 1
fi
echo "Built Series of Tubes ${VERSION} (${BUILD_DATE}) into _site/"
