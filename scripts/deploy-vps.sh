#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# deploy-vps.sh — Build locally, push to VPS, sync metadata, restart
#
# Usage:
#   ./scripts/deploy-vps.sh [user@host]
#
# Defaults to root@76.13.181.251 if no argument given.
# Expects SSH key auth to be configured.
###############################################################################

VPS="${1:-root@76.13.181.251}"
REMOTE_BASE="/var/www/cms"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== CMS Deploy to ${VPS} ==="
echo "Repo root: ${REPO_ROOT}"
echo ""

# ─── 1. Build frontend ─────────────────────────────────────────────────────
echo "=== 1/7  Building frontend ==="
cd "$REPO_ROOT"
npx nx build cms-front
echo "Frontend build complete."

# ─── 2. Build backend ──────────────────────────────────────────────────────
echo "=== 2/7  Building backend ==="
npx nx build cms-server
echo "Backend build complete."

# ─── 3. Sync frontend to VPS ───────────────────────────────────────────────
echo "=== 3/7  Syncing frontend to VPS ==="
rsync -avz --delete \
  "${REPO_ROOT}/packages/cms-front/build/" \
  "${VPS}:${REMOTE_BASE}/front/"
echo "Frontend synced."

# ─── 4. Sync backend to VPS ────────────────────────────────────────────────
echo "=== 4/7  Syncing backend to VPS ==="
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.local-storage' \
  "${REPO_ROOT}/packages/cms-server/dist/" \
  "${VPS}:${REMOTE_BASE}/server/dist/"

# Also sync package.json + yarn.lock for dependency installation
rsync -avz \
  "${REPO_ROOT}/packages/cms-server/package.json" \
  "${VPS}:${REMOTE_BASE}/server/package.json"
rsync -avz \
  "${REPO_ROOT}/yarn.lock" \
  "${VPS}:${REMOTE_BASE}/server/yarn.lock" 2>/dev/null || true

# Install/update server dependencies on VPS
ssh "${VPS}" bash -s <<'REMOTE_DEPS'
set -euo pipefail
cd /var/www/cms/server
if command -v yarn &>/dev/null; then
  yarn install --production 2>/dev/null || npm install --omit=dev
else
  npm install --omit=dev
fi
REMOTE_DEPS
echo "Backend synced."

# ─── 5. Inject REACT_APP_SERVER_BASE_URL into index.html ───────────────────
echo "=== 5/7  Injecting runtime env ==="
ssh "${VPS}" bash -s <<'REMOTE_INJECT'
set -euo pipefail
INDEX="/var/www/cms/front/index.html"
if [ -f "$INDEX" ]; then
  # Read SERVER_URL from ecosystem config if available
  SERVER_URL=$(node -e "
    try {
      const cfg = require('/var/www/cms/ecosystem.config.js');
      console.log(cfg.apps[0].env.SERVER_URL || '');
    } catch(e) { console.log(''); }
  " 2>/dev/null || echo "")

  if [ -n "$SERVER_URL" ]; then
    # Replace the __REACT_APP_SERVER_BASE_URL__ placeholder or inject the script
    if grep -q '__REACT_APP_SERVER_BASE_URL__' "$INDEX"; then
      sed -i "s|__REACT_APP_SERVER_BASE_URL__|${SERVER_URL}|g" "$INDEX"
      echo "Injected SERVER_URL=${SERVER_URL} (placeholder replacement)"
    elif ! grep -q 'REACT_APP_SERVER_BASE_URL' "$INDEX"; then
      sed -i "s|</head>|<script>window._env_ = { REACT_APP_SERVER_BASE_URL: \"${SERVER_URL}\" };</script></head>|" "$INDEX"
      echo "Injected SERVER_URL=${SERVER_URL} (script tag)"
    else
      echo "SERVER_URL already present in index.html"
    fi
  else
    echo "Warning: Could not read SERVER_URL from ecosystem.config.js"
  fi
else
  echo "Warning: index.html not found at $INDEX"
fi
REMOTE_INJECT
echo "Runtime env injected."

# ─── 6. Run migrations + sync metadata ─────────────────────────────────────
echo "=== 6/7  Running migrations & workspace:sync-metadata ==="
ssh "${VPS}" bash -s <<'REMOTE_SYNC'
set -euo pipefail
cd /var/www/cms

# Source environment from ecosystem config for the CLI commands
export $(node -e "
  const cfg = require('./ecosystem.config.js');
  const env = cfg.apps[0].env;
  Object.entries(env).forEach(([k,v]) => console.log(k + '=' + v));
" 2>/dev/null | xargs)

# Stop the server briefly for migrations
pm2 stop cms-server 2>/dev/null || true

echo "Running database migrations..."
cd /var/www/cms/server
node dist/command/command.js database:migrate:prod 2>/dev/null || echo "Migration command not available, skipping"

echo "Syncing workspace metadata (creates workspace schemas + standard objects)..."
node dist/command/command.js workspace:sync-metadata --verbose

cd /var/www/cms
REMOTE_SYNC
echo "Migrations & metadata sync complete."

# ─── 7. Restart PM2 ────────────────────────────────────────────────────────
echo "=== 7/7  Restarting PM2 ==="
ssh "${VPS}" bash -s <<'REMOTE_RESTART'
set -euo pipefail
cd /var/www/cms
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Wait for server to be healthy
echo "Waiting for server to start..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/healthz > /dev/null 2>&1; then
    echo "Server healthy after ${i}s"
    break
  fi
  sleep 1
done

# Verify
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
echo "Verify: curl -s https://cms.nexusmindstech.com/healthz"
