# Stop and remove running containers
cd /opt/microtales || true
docker compose down || true

# Remove the app directory
sudo rm -rf /opt/microtales

# Optionally prune unused Docker resources
docker system prune -af --volumes

# Also clean up Nginx site config if it was created
sudo rm -f /etc/nginx/sites-available/microtales
sudo rm -f /etc/nginx/sites-enabled/microtales

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
