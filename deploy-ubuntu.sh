#!/bin/bash

# Exit on error
set -e

# Print commands for debugging
set -x

# Check if script is run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# Configuration
APP_NAME="microtales"
GIT_REPO="https://github.com/double2xk/micro-tales-vb"
DOMAIN="microtalesvb.com"
EMAIL="admin@microtalesvb.com"

echo "======================================================"
echo "Setting up MicroTales on Ubuntu Server"
echo "======================================================"

# Update system packages
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required dependencies
echo "🔧 Installing dependencies..."
apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    ufw

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /opt/${APP_NAME}

# Clone the repository
echo "📥 Cloning repository..."
git clone ${GIT_REPO} /opt/${APP_NAME}
cd /opt/${APP_NAME}

# Generate secure passwords for environment variables
echo "🔑 Creating environment configuration..."
DB_PASSWORD=$(openssl rand -base64 24)
AUTH_SECRET=$(openssl rand -base64 32)

# Create environment file
cat > /opt/${APP_NAME}/.env << EOL
# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/${APP_NAME}

# Next Auth
AUTH_SECRET="${AUTH_SECRET}"

# Node
NODE_ENV=production
EOL

# Build and start the application with Docker Compose
echo "🚀 Building and starting the Docker containers..."
cd /opt/${APP_NAME}

# Export environment variables for Docker Compose
export DB_PASSWORD
export AUTH_SECRET

# Build and start the containers
docker compose -f docker-compose.prod.yml up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for services to initialize..."
sleep 15

# Add database initialization here
echo "🔧 Initializing database..."
docker compose -f docker-compose.prod.yml exec app pnpm db:generate
docker compose -f docker-compose.prod.yml exec app pnpm db:push

echo "🌱 Initializing database with seed data..."
docker compose -f docker-compose.prod.yml exec app pnpm db:seed

# Install Nginx
echo "🌐 Installing and configuring Nginx..."
apt-get install -y nginx

# Configure Nginx
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

# Enable the site and remove default if it exists
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Set up SSL with Certbot (only if domain is configured)
if [ "${DOMAIN}" != "microtalesvb.com" ]; then
    echo "🔒 Setting up SSL with Certbot..."
    apt-get install -y certbot python3-certbot-nginx
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

    # Set up auto-renewal for SSL
    echo "0 3 * * * certbot renew --quiet" | crontab -
else
    echo "⚠️ Using default domain name. SSL setup skipped."
    echo "⚠️ Update the DOMAIN variable and run certbot manually when ready."
fi

# Setup database backup
echo "💾 Setting up database backups..."
mkdir -p /opt/backups

cat > /opt/backups/backup-db.sh << EOL
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/backups"
docker compose -f /opt/${APP_NAME}/docker-compose.prod.yml exec -T db pg_dump -U postgres ${APP_NAME} > \${BACKUP_DIR}/${APP_NAME}-\${TIMESTAMP}.sql
find \${BACKUP_DIR} -name "*.sql" -type f -mtime +7 -delete
EOL

chmod +x /opt/backups/backup-db.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup-db.sh") | crontab -

# Create a service restart script
cat > /opt/${APP_NAME}/restart.sh << EOL
#!/bin/bash
cd /opt/${APP_NAME}
git pull
docker compose -f docker-compose.prod.yml up -d --build
EOL

chmod +x /opt/${APP_NAME}/restart.sh

echo "======================================================"
echo "✅ Setup complete! MicroTales is now deployed."
echo "======================================================"
echo "📝 Site URL: https://${DOMAIN}"
echo "📝 Database is backed up daily at 2 AM"
echo "📝 SSL certificates are renewed automatically"
echo ""
echo "⚠️ IMPORTANT: Remember to change default credentials!"
echo "⚠️ To update the application, run: /opt/${APP_NAME}/restart.sh"
echo "======================================================"