# Exit on error
set -e
# Print each command before executing (for debugging)
set -x

# Check if script is run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# === CONFIGURATION ===
APP_NAME="microtales"
GIT_REPO="https://github.com/double2xk/micro-tales-vb"
DOMAIN="microtales.local"
EMAIL="admin@microtales.local"

# Add domain to /etc/hosts if not already present
if ! grep -q "${DOMAIN}" /etc/hosts; then
    echo "127.0.0.1 ${DOMAIN}" >> /etc/hosts
    echo "✅ Added ${DOMAIN} to /etc/hosts"
else
    echo "ℹ️ ${DOMAIN} already exists in /etc/hosts"
fi

echo "======================================================"
echo "🚀 Setting up MicroTales on Ubuntu Server"
echo "======================================================"

# === SYSTEM SETUP ===
apt-get update && apt-get upgrade -y

# Install system dependencies
apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    ufw \
    nginx

# === DOCKER INSTALL ===
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker

# === FIREWALL CONFIG ===
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# === APP SETUP ===
mkdir -p /opt/${APP_NAME}
git clone ${GIT_REPO} /opt/${APP_NAME}
cd /opt/${APP_NAME}

# === ENVIRONMENT VARIABLES ===
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password" # (insecure for demo — ideally generate randomly)
POSTGRES_DB="${APP_NAME}"
AUTH_SECRET=$(openssl rand -base64 32)

NEXT_PUBLIC_URL="http://${DOMAIN}"
NEXTAUTH_URL="http://${DOMAIN}"
PGADMIN_DEFAULT_EMAIL="${EMAIL}"
PGADMIN_DEFAULT_PASSWORD="adminpassword"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
HOSTNAME="0.0.0.0"

cat > .env << EOL
DATABASE_URL=${DATABASE_URL}
AUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="${NEXTAUTH_URL}"
NODE_ENV=production
NEXT_PUBLIC_URL="${NEXT_PUBLIC_URL}"
PGADMIN_DEFAULT_EMAIL="${PGADMIN_DEFAULT_EMAIL}"
PGADMIN_DEFAULT_PASSWORD="${PGADMIN_DEFAULT_PASSWORD}"
POSTGRES_USER="${POSTGRES_USER}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
POSTGRES_DB="${POSTGRES_DB}"
HOSTNAME="${HOSTNAME}"
EOL

# === DOCKER BUILD ===
docker compose -f docker-compose.yml up -d --build

# Wait for Postgres to become ready
until docker compose exec -T db pg_isready -U ${POSTGRES_USER}; do
    sleep 2
done

# Update Postgres auth method to scram-sha-256
docker exec -it micro-tales-db psql -U postgres -c "ALTER USER postgres WITH PASSWORD '${POSTGRES_PASSWORD}'"
docker exec -it micro-tales-db bash -c "sed -i 's/^host\s\+all\s\+all\s\+all\s\+md5/host all all all scram-sha-256/' /var/lib/postgresql/data/pg_hba.conf"
docker restart micro-tales-db

# === NGINX CONFIG ===
cat > /etc/nginx/sites-available/${APP_NAME} << EOL
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

# === BACKUPS ===
mkdir -p /opt/backups

cat > /opt/backups/backup-db.sh << EOL
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/backups"
docker compose -f /opt/${APP_NAME}/docker-compose.yml exec -T db pg_dump -U postgres ${APP_NAME} > \${BACKUP_DIR}/${APP_NAME}-\${TIMESTAMP}.sql
find \${BACKUP_DIR} -name "*.sql" -type f -mtime +7 -delete
EOL

chmod +x /opt/backups/backup-db.sh

echo "======================================================"
echo "✅ MicroTales deployed!"
echo "🌍 Access it at: http://${DOMAIN}"
echo "📦 View logs: docker compose -f /opt/${APP_NAME}/docker-compose.yml logs -f"
echo "🔄 Restart app: docker compose -f /opt/${APP_NAME}/docker-compose.yml restart"
echo "🛑 Stop app: docker compose -f /opt/${APP_NAME}/docker-compose.yml down"
echo "======================================================"
