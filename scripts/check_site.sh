#!/bin/sh
set -eu

site_output=$(mktemp -d "${TMPDIR:-/tmp}/hugo-site-check.XXXXXX")
site_cache=$(mktemp -d "${TMPDIR:-/tmp}/hugo-cache-check.XXXXXX")
trap 'rm -rf "$site_output" "$site_cache"' EXIT

HUGO_ENV=production hugo \
  --cacheDir "$site_cache" \
  --destination "$site_output" \
  --cleanDestinationDir \
  --minify \
  --enableGitInfo \
  --panicOnWarning

python3 scripts/validate_site.py "$site_output"
