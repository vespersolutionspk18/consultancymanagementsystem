#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# deploy-vps.sh — Pull latest code on VPS, build, sync metadata, restart
#
# Usage:
#   ./scripts/deploy-vps.sh [user@host]
#
# Defaults to root@76.13.181.251 if no argument given.
# Expects SSH key auth and the repo cloned at /var/www/cms/repo.
#
# Architecture:
#   - VPS has full repo clone at /var/www/cms/repo with node_modules
#   - Frontend build output is copied to /var/www/cms/front/ (served by Nginx)
#   - Server runs from repo via PM2 (ecosystem.config.js points to repo dist)
###############################################################################

VPS="${1:-root@76.13.181.251}"
REMOTE_REPO="/var/www/cms/repo"
REMOTE_FRONT="/var/www/cms/front"

echo "=== CMS Deploy to ${VPS} ==="
echo ""

# ─── 1. Pull latest code ───────────────────────────────────────────────────
echo "=== 1/6  Pulling latest code ==="
ssh "${VPS}" bash -s <<REMOTE_PULL
set -euo pipefail
cd ${REMOTE_REPO}
git pull
echo "Git pull complete."
REMOTE_PULL

# ─── 2. Install dependencies (if needed) ──────────────────────────────────
echo "=== 2/6  Checking dependencies ==="
ssh "${VPS}" bash -s <<REMOTE_DEPS
set -euo pipefail
cd ${REMOTE_REPO}
if [ ! -d "node_modules/@nestjs" ]; then
  echo "Installing dependencies..."
  corepack enable 2>/dev/null || true
  yarn install 2>&1 | tail -10
else
  echo "node_modules present ($(ls node_modules/ | wc -l) packages). Running yarn install for any updates..."
  yarn install 2>&1 | tail -5
fi
REMOTE_DEPS

# ─── 3. Build frontend + backend ──────────────────────────────────────────
echo "=== 3/6  Building frontend & backend ==="
ssh "${VPS}" bash -s <<REMOTE_BUILD
set -euo pipefail
cd ${REMOTE_REPO}
echo "Building frontend..."
npx nx build cms-front 2>&1 | tail -5
echo ""
echo "Building backend..."
npx nx build cms-server 2>&1 | tail -5
echo "Builds complete."
REMOTE_BUILD

# ─── 4. Copy frontend build to serving directory ──────────────────────────
echo "=== 4/6  Deploying frontend ==="
ssh "${VPS}" bash -s <<REMOTE_FRONT
set -euo pipefail
rsync -a --delete ${REMOTE_REPO}/packages/cms-front/build/ ${REMOTE_FRONT}/

# Inject runtime SERVER_URL into index.html
INDEX="${REMOTE_FRONT}/index.html"
if [ -f "\$INDEX" ]; then
  SERVER_URL=\$(node -e "
    try {
      const cfg = require('/var/www/cms/ecosystem.config.js');
      console.log(cfg.apps[0].env.SERVER_URL || '');
    } catch(e) { console.log(''); }
  " 2>/dev/null || echo "")

  if [ -n "\$SERVER_URL" ]; then
    if grep -q '__REACT_APP_SERVER_BASE_URL__' "\$INDEX"; then
      sed -i "s|__REACT_APP_SERVER_BASE_URL__|\${SERVER_URL}|g" "\$INDEX"
      echo "Injected SERVER_URL=\${SERVER_URL} (placeholder)"
    elif ! grep -q 'REACT_APP_SERVER_BASE_URL' "\$INDEX"; then
      sed -i "s|</head>|<script>window._env_ = { REACT_APP_SERVER_BASE_URL: \"\${SERVER_URL}\" };</script></head>|" "\$INDEX"
      echo "Injected SERVER_URL=\${SERVER_URL} (script tag)"
    else
      echo "SERVER_URL already present in index.html"
    fi
  fi
fi
echo "Frontend deployed."
REMOTE_FRONT

# ─── 5. Run workspace:sync-metadata ───────────────────────────────────────
echo "=== 5/6  Running workspace:sync-metadata ==="
ssh "${VPS}" bash -s <<REMOTE_SYNC
set -euo pipefail

# Source environment from ecosystem config
eval \$(node -e "
  const cfg = require('/var/www/cms/ecosystem.config.js');
  const env = cfg.apps[0].env;
  Object.entries(env).forEach(([k,v]) => console.log('export ' + k + '=\"' + v + '\"'));
")

# Stop server briefly for metadata sync
pm2 stop cms-server 2>/dev/null || true

cd ${REMOTE_REPO}/packages/cms-server
echo "Syncing workspace metadata..."
node dist/command/command.js workspace:sync-metadata --verbose 2>&1 | tail -20
echo "Metadata sync complete."
REMOTE_SYNC

# ─── 6. Restart PM2 ───────────────────────────────────────────────────────
echo "=== 6/6  Restarting PM2 ==="
ssh "${VPS}" bash -s <<'REMOTE_RESTART'
set -euo pipefail
cd /var/www/cms
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "Waiting for server to start..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/healthz > /dev/null 2>&1; then
    echo "Server healthy after ${i}s"
    break
  fi
  sleep 1
done

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/healthz 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "Health check: OK (200)"
else
  echo "Warning: Health check returned ${HTTP_CODE}"
  echo "Check logs: pm2 logs cms-server --lines 50"
fi
REMOTE_RESTART

echo ""
echo "=== Deploy complete ==="
echo "Verify: https://cms.nexusmindstech.com/healthz"
