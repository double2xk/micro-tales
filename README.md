# MicroTales

A web platform for sharing and discovering microfiction stories.

## Overview

MicroTales is a full-stack web application that allows users to:

- Read short microfiction stories (under 500 words)
- Contribute their own stories as guests or registered authors
- Rate stories with a star rating system
- Filter stories by genre and popularity
- Manage their own authored content

## Technology Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: tRPC for type-safe API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Deployment**: Docker and Docker Compose

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/double2xk/micro-tales-vb
   cd micro-tales-vb
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development database:
   ```bash
   chmod +x ./scripts/start-database.sh
   ./scripts/start-database.sh
   ```

4. Apply database migrations:
   ```bash
   pnpm db:push
   ```

5. Seed the database with initial data:
   ```bash
   pnpm db:seed
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Deploying on Ubuntu Server

1. Obtain a fresh Ubuntu server installation

2. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

3. Copy the deployment script to your server:
   ```bash
   scp deploy-ubuntu.sh user@your-server-ip:~/
   ```

4. Make the script executable and run it as root:
   ```bash
   chmod +x deploy-ubuntu.sh
   sudo ./deploy-ubuntu.sh
   ```

5. The script will:
    - Install all necessary dependencies
    - Clone the repository
    - Set up Docker and PostgreSQL
    - Configure Nginx as a reverse proxy
    - Set up SSL with Let's Encrypt
    - Start the application

### Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Clone the repository on your server
2. Create a `.env` file with your environment variables
3. Build the Docker images:
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```
4. Start the containers:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

## Features

### Core Features

- **User Authentication**: Secure login and registration
- **Story Management**: Create, read, update, and delete stories
- **Rating System**: Rate stories on a 5-star scale
- **Genre Filtering**: Browse stories by genre
- **Public/Private Stories**: Control visibility of your stories

### Advanced Features

- **Guest Contributions**: Submit stories without an account
- **Story Security Codes**: Claim guest stories with secure codes


## Acknowledgements

This project was created as part of a web development assessment.