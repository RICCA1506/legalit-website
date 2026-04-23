#!/usr/bin/env bash
# Run the SEO regression suite against the production server bundle.
# The test runner builds dist/index.cjs on demand (when stale or missing),
# spawns it on a free port in NODE_ENV=production, and asserts the
# canonical/redirect/410 contract for the routes that previously regressed
# (see tests/seo.test.mjs and replit.md > "SEO Regression Tests").
set -euo pipefail
cd "$(dirname "$0")/.."
exec node --test --test-timeout=120000 tests/seo.test.mjs "$@"
