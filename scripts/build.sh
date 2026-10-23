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

# Release notes for this version, baked into the page ("What's new") and
# published as version.json so open games can spot a newer release.
NOTES="$(node scripts/release-notes.js "$VERSION")"
node -e '
  const fs=require("fs"),[,v,d,notes]=process.argv;
  const f="_site/index.html";
  fs.writeFileSync(f,fs.readFileSync(f,"utf8").replace("/*__RELEASE_NOTES__*/[]",notes));
  fs.writeFileSync("_site/version.json",JSON.stringify({version:v,date:d,notes:JSON.parse(notes)},null,2)+"\n");
' "$VERSION" "$BUILD_DATE" "$NOTES"

if grep -rl "__VERSION__\|__BUILD_DATE__" _site >/dev/null; then
  echo "error: unreplaced placeholders left in _site" >&2
  exit 1
fi
echo "Built Series of Tubes ${VERSION} (${BUILD_DATE}) into _site/"
