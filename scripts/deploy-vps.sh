#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# deploy-vps.sh — Deploy CMS to VPS
#
# Usage:  ./scripts/deploy-vps.sh [user@host]
#
# Expects:
#   - SSH key auth configured for VPS
#   - Repo cloned at /var/www/cms/repo on VPS (with node_modules installed)
#   - ecosystem.config.js at /var/www/cms/ with env vars
#   - rsync installed on both local and VPS
#
# What it does:
#   1. Build frontend locally (VPS lacks memory for Vite)
#   2. rsync frontend build to VPS
#   3. Pull latest code on VPS, build backend (fast SWC compile)
#   4. Copy backend dist to server dir
#   5. Run workspace:sync-metadata from repo (has full node_modules)
#   6. Restart PM2
###############################################################################

VPS="${1:-root@76.13.181.251}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== CMS Deploy to ${VPS} ==="

# ─── 1. Build frontend locally ─────────────────────────────────────────────
echo "=== 1/6  Building frontend (local) ==="
cd "$REPO_ROOT"
npx nx build cms-front 2>&1 | tail -5
echo "Frontend built."

# ─── 2. Sync frontend to VPS ───────────────────────────────────────────────
echo "=== 2/6  Syncing frontend to VPS ==="
rsync -az --delete \
  "${REPO_ROOT}/packages/cms-front/build/" \
  "${VPS}:/var/www/cms/front/"

# Inject runtime SERVER_URL
ssh "${VPS}" bash <<'EOF'
INDEX="/var/www/cms/front/index.html"
SERVER_URL=$(node -e "try{console.log(require('/var/www/cms/ecosystem.config.js').apps[0].env.SERVER_URL)}catch(e){console.log('')}" 2>/dev/null)
[ -z "$SERVER_URL" ] && exit 0
grep -q 'REACT_APP_SERVER_BASE_URL' "$INDEX" && echo "SERVER_URL already injected" && exit 0
grep -q '__REACT_APP_SERVER_BASE_URL__' "$INDEX" && sed -i "s|__REACT_APP_SERVER_BASE_URL__|${SERVER_URL}|g" "$INDEX" && echo "Injected via placeholder" && exit 0
sed -i "s|</head>|<script>window._env_={REACT_APP_SERVER_BASE_URL:\"${SERVER_URL}\"};</script></head>|" "$INDEX"
echo "Injected SERVER_URL=${SERVER_URL}"
EOF
echo "Frontend deployed."

# ─── 3. Pull + build backend on VPS ────────────────────────────────────────
echo "=== 3/6  Building backend on VPS ==="
ssh "${VPS}" bash <<'EOF'
set -euo pipefail
cd /var/www/cms/repo
git pull
npx nx build cms-server 2>&1 | tail -3
echo "Backend built."
EOF

# ─── 4. Copy backend dist to server dir ────────────────────────────────────
echo "=== 4/6  Deploying backend ==="
ssh "${VPS}" bash <<'EOF'
set -euo pipefail
rsync -a --delete /var/www/cms/repo/packages/cms-server/dist/ /var/www/cms/server/dist/
echo "Backend deployed."
EOF

# ─── 5. workspace:sync-metadata ────────────────────────────────────────────
echo "=== 5/6  Running workspace:sync-metadata ==="
ssh "${VPS}" bash <<'EOF'
set -euo pipefail

# Load env from ecosystem config
eval $(node -e "
  const e=require('/var/www/cms/ecosystem.config.js').apps[0].env;
  Object.entries(e).forEach(([k,v])=>console.log('export '+k+'=\"'+v+'\"'));
")

pm2 stop cms-server 2>/dev/null || true

cd /var/www/cms/repo/packages/cms-server
node dist/command/command.js workspace:sync-metadata --verbose 2>&1 | tail -10
echo "Metadata sync done."
EOF

# ─── 6. Restart PM2 ────────────────────────────────────────────────────────
echo "=== 6/6  Restarting PM2 ==="
ssh "${VPS}" bash <<'EOF'
set -euo pipefail
cd /var/www/cms
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
for i in $(seq 1 30); do
  curl -sf http://localhost:3000/healthz >/dev/null 2>&1 && echo "Healthy after ${i}s" && break
  sleep 1
done
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/healthz 2>/dev/null || echo "000")
echo "Health: ${HTTP}"
EOF

echo ""
echo "=== Deploy complete ==="
echo "https://cms.nexusmindstech.com"
