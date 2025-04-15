I'll format the second half of your deployment guide in proper Markdown format to match the first half. Here you go:

# 🚀 MicroTales - Ubuntu Deployment Guide
This guide helps you deploy the **MicroTales** web app on a fresh Ubuntu server in just a few steps.
---
## 🧰 Requirements
- A **fresh Ubuntu installation** (tested on Ubuntu 25.04 ARM64)
- Internet access
- `curl` installed
---
## 📦 Install `curl` (if not already installed)
First, ensure `curl` is installed. If it's not installed, you can install it with the following command:
```bash
sudo apt update && sudo apt install curl -y
```

## ⚙️ Run the Setup Script
To deploy the application, you need to download and run the deployment script.

### Step 1: Download the Deployment Script
Run the following command to download the deploy-ubuntu.sh script from the GitHub repository:
```bash
sudo curl -O https://raw.githubusercontent.com/double2xk/micro-tales-vb/refs/heads/main/scripts/deploy-ubuntu.sh
```

### Step 2: Make the Script Executable
Change the permissions to make the script executable:
```bash
chmod +x deploy-ubuntu.sh
```

### Step 3: Run the Script
Now, run the deployment script:
```bash
sudo ./deploy-ubuntu.sh
```

## 🧹 Troubleshooting (Cleanup)
If something goes wrong during the deployment, you can use the cleanup script to reset your environment and try again.

### Step 1: Download the Cleanup Script
Run the following command to download the cleanup script:
```bash
curl -O https://raw.githubusercontent.com/double2xk/micro-tales-vb/refs/heads/main/scripts/cleanup-ubuntu.sh
```

### Step 2: Make the Cleanup Script Executable
Change the permissions to make the script executable:
```bash
chmod +x cleanup-ubuntu.sh
```

### Step 3: Run the Cleanup Script
Run the cleanup script to reset your environment:
```bash
sudo ./cleanup-ubuntu.sh
```

### Step 4: Re-run the Deployment Script
After cleanup, try running the deploy-ubuntu.sh script again:
```bash
sudo ./deploy-ubuntu.sh
```

## 🌐 Domain Configuration
During deployment, if you're using a local setup (e.g., microtales.local), the script will automatically add the necessary entry to your `/etc/hosts` file.

If you're using a custom domain, follow the instructions that will be outputted by the deployment script for setting up SSL and DNS.

> **Note:** The script automatically handles SSL configuration if you're using a valid domain name.

## ✅ Done!
Once deployment finishes, you can access the app via the following URLs:
- **Local Access:** http://microtales.local
- **Custom Domain:** If you configured a custom domain, access it using that domain (e.g., http://yourdomain.com).

## 🔧 Additional Notes
- The application is deployed using Docker containers, so make sure Docker is properly installed on your Ubuntu server.
- If you're setting up SSL with Certbot, ensure your domain is correctly pointed to your server's IP address.