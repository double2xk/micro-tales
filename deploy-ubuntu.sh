#!/bin/bash

# Exit on any error
set -e

# Print commands before executing
set -x

# Script should be run as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# Configuration variables - customize these
APP_NAME="micro-tales"
GIT_REPO="https://github.com/double2xk/micro-tales-vb"
DOMAIN="microtales.com"  # Replace with your actual domain
EMAIL="admin@microtales.com"  # For SSL certificate

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

# Install Docker and Docker Compose
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker

# Install Node.js (for potential build processes)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pnpm

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

# Generate secure passwords and create .env file
echo "🔑 Creating environment configuration..."
DB_PASSWORD=$(openssl rand -base64 24)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > /opt/${APP_NAME}/.env << EOL
# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/${APP_NAME}

# Next Auth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Next.js
NODE_ENV=production
EOL

# Docker Compose file for production
cat > /opt/${APP_NAME}/docker-compose.prod.yml << EOL
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${APP_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/${APP_NAME}
      - NEXTAUTH_URL=https://${DOMAIN}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
EOL

# Install dependencies and build the application
echo "🔨 Building the application..."
pnpm install
pnpm run build

# Start the application with Docker Compose
echo "🚀 Starting the application..."
docker compose -f docker-compose.prod.yml up -d

# Install and configure Nginx
echo "🌐 Installing and configuring Nginx..."
apt-get install -y nginx

# Create Nginx configuration
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

# Enable the site and restart Nginx
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Install and configure SSL with Certbot
echo "🔒 Setting up SSL with Certbot..."
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

# Add Certbot auto-renewal to crontab
echo "0 3 * * * certbot renew --quiet" | crontab -

# Setup database auto-backup (optional)
echo "💾 Setting up database backup..."
mkdir -p /opt/backups

cat > /opt/backups/backup-db.sh << EOL
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/opt/backups"
docker exec ${APP_NAME}-db-1 pg_dump -U postgres ${APP_NAME} > \${BACKUP_DIR}/${APP_NAME}-\${TIMESTAMP}.sql
find \${BACKUP_DIR} -name "*.sql" -type f -mtime +7 -delete
EOL

chmod +x /opt/backups/backup-db.sh
echo "0 2 * * * /opt/backups/backup-db.sh" | crontab -

# Initialize the database with seed data
echo "🌱 Initializing database with seed data..."
cd /opt/${APP_NAME}
npx tsx src/scripts/seed.ts

echo "✅ Setup complete! Your application is running at https://${DOMAIN}"
echo "📝 Default admin credentials: admin@admin.com / password123"
echo "📝 Default user credentials: john@doe.com / password123"
