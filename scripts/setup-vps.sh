#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

echo "=== 1. System updates ==="
apt-get update -y && apt-get upgrade -y
apt-get install -y curl gnupg2 lsb-release ca-certificates apt-transport-https wget sudo

echo "=== 2. PostgreSQL 16 ==="
if ! command -v psql &>/dev/null; then
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg 2>/dev/null || true
    CODENAME="bookworm"
    echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt ${CODENAME}-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    apt-get update -y
    apt-get install -y postgresql-16 postgresql-client-16
fi
systemctl enable postgresql
systemctl start postgresql
for i in $(seq 1 30); do su - postgres -c "pg_isready" &>/dev/null && break; sleep 1; done

su - postgres -c "psql" <<'EOSQL'
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cms') THEN
        CREATE ROLE cms WITH LOGIN PASSWORD 'cms_secure_pass_2024' CREATEDB;
    ELSE
        ALTER ROLE cms WITH PASSWORD 'cms_secure_pass_2024';
    END IF;
END $$;
SELECT 'CREATE DATABASE cms OWNER cms' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cms')\gexec
\c cms
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL PRIVILEGES ON DATABASE cms TO cms;
GRANT ALL PRIVILEGES ON SCHEMA public TO cms;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cms;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cms;
EOSQL

PG_CONF=$(find /etc/postgresql -name postgresql.conf 2>/dev/null | head -1)
if [ -n "$PG_CONF" ]; then
    sed -i "s/^#\?listen_addresses\s*=.*/listen_addresses = 'localhost'/" "$PG_CONF"
    systemctl restart postgresql
fi
echo "PostgreSQL done"

echo "=== 3. Redis ==="
apt-get install -y redis-server
REDIS_CONF="/etc/redis/redis.conf"
if [ -f "$REDIS_CONF" ]; then
    sed -i 's/^bind .*/bind 127.0.0.1 ::1/' "$REDIS_CONF"
    grep -q "^maxmemory " "$REDIS_CONF" && sed -i 's/^maxmemory .*/maxmemory 512mb/' "$REDIS_CONF" || echo "maxmemory 512mb" >> "$REDIS_CONF"
    grep -q "^maxmemory-policy " "$REDIS_CONF" && sed -i 's/^maxmemory-policy .*/maxmemory-policy allkeys-lru/' "$REDIS_CONF" || echo "maxmemory-policy allkeys-lru" >> "$REDIS_CONF"
fi
systemctl enable redis-server && systemctl restart redis-server
echo "Redis done"

echo "=== 4. Node.js 20 LTS ==="
if ! command -v node &>/dev/null || ! node --version | grep -q "^v20"; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
corepack enable
corepack prepare yarn@stable --activate 2>/dev/null || true
echo "Node done: $(node --version)"

echo "=== 5. Nginx ==="
apt-get install -y nginx
cat > /etc/nginx/sites-available/cms <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/cms/front;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml font/woff2;

    client_max_body_size 50M;

    location /api { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection 'upgrade'; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; proxy_read_timeout 90s; }
    location /graphql { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection 'upgrade'; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; proxy_read_timeout 90s; }
    location /rest { proxy_pass http://localhost:3000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection 'upgrade'; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; proxy_read_timeout 90s; }
    location /healthz { proxy_pass http://localhost:3000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
    location /files { proxy_pass http://localhost:3000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; client_max_body_size 50M; }

    location / { try_files $uri $uri/ /index.html; }
}
NGINX
ln -sf /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/cms
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx
echo "Nginx done"

echo "=== 6. App directories ==="
id -u cms &>/dev/null || useradd --system --create-home --shell /bin/bash cms
mkdir -p /var/www/cms/{front,server,logs}
mkdir -p /var/www/cms/server/.local-storage
echo '<h1>CMS - Awaiting Deploy</h1>' > /var/www/cms/front/index.html
chown -R cms:cms /var/www/cms
echo "Directories done"

echo "=== 7. PM2 ==="
npm install -g pm2
pm2 startup systemd -u cms --hp /home/cms 2>/dev/null || true
echo "PM2 done"

echo "=== 8. Ecosystem config ==="
ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
FILE_TOKEN_SECRET=$(openssl rand -hex 32)

cat > /var/www/cms/ecosystem.config.js <<ECOSYSTEM
module.exports = {
  apps: [{
    name: 'cms-server',
    script: '/var/www/cms/server/dist/main.js',
    cwd: '/var/www/cms/server/',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/www/cms/logs/cms-server-error.log',
    out_file: '/var/www/cms/logs/cms-server-out.log',
    env: {
      NODE_ENV: 'production',
      PG_DATABASE_URL: 'postgresql://cms:cms_secure_pass_2024@localhost:5432/cms',
      REDIS_URL: 'redis://localhost:6379',
      SERVER_URL: 'http://76.13.181.251',
      FRONT_BASE_URL: 'http://76.13.181.251',
      PORT: 3000,
      STORAGE_TYPE: 'local',
      STORAGE_LOCAL_PATH: '/var/www/cms/server/.local-storage',
      SIGN_IN_PREFILLED: 'true',
      ACCESS_TOKEN_SECRET: '${ACCESS_TOKEN_SECRET}',
      LOGIN_TOKEN_SECRET: '${LOGIN_TOKEN_SECRET}',
      REFRESH_TOKEN_SECRET: '${REFRESH_TOKEN_SECRET}',
      FILE_TOKEN_SECRET: '${FILE_TOKEN_SECRET}',
    },
  }],
};
ECOSYSTEM
chown cms:cms /var/www/cms/ecosystem.config.js
echo "Ecosystem done"

echo "=== 9. UFW Firewall ==="
apt-get install -y ufw
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "UFW done"

echo "=== 10. Swap 2GB ==="
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo "Swap done"

echo ""
echo "========= VERIFICATION ========="
echo "Node: $(node --version)"
echo "Yarn: $(yarn --version 2>/dev/null || echo N/A)"
echo "PM2: $(pm2 --version 2>/dev/null)"
echo "PG: $(psql --version)"
echo "Redis: $(redis-server --version | head -c 40)"
nginx -v 2>&1
echo ""
PGPASSWORD=cms_secure_pass_2024 psql -U cms -d cms -h localhost -c "SELECT 1 AS ok;"
redis-cli ping
curl -s -o /dev/null -w "Nginx HTTP: %{http_code}\n" http://localhost
free -h | head -3
swapon --show
echo ""
echo "========= SETUP COMPLETE ========="
