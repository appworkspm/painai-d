# PainAI Deployment on VMware

This directory contains the Docker configuration files for deploying the PainAI application on a VMware virtual machine.

## Prerequisites

- VMware Workstation/ESXi with a Linux VM (Ubuntu 20.04+ recommended)
- Docker installed on the VM
- Docker Compose installed on the VM
- Git (for cloning the repository)

## Directory Structure

```
docker/vmware/
├── backend.Dockerfile    # Backend Docker configuration
├── frontend.Dockerfile  # Frontend Docker configuration
├── nginx.conf          # Nginx configuration for the frontend
├── docker-compose.yml   # Docker Compose configuration
├── .env.example        # Example environment variables
└── deploy.sh           # Deployment script
```

## Deployment Steps

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone https://github.com/yourusername/painai.git
   cd painai/docker/vmware
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   nano .env  # Edit the configuration as needed
   ```

3. **Make the deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

4. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

5. **Verify the deployment**:
   - Frontend: http://vm-ip-address
   - Backend API: http://vm-ip-address:3000
   - Database: Accessible on port 5432 (PostgreSQL)

## Environment Variables

Edit the `.env` file to configure your deployment:

- `DB_USER`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: Database name (default: painai)
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Node.js environment (production)
- `VITE_API_BASE_URL`: Base URL for API requests (default: /api)

## Maintenance

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Update Deployment
1. Pull the latest changes
2. Rebuild the containers:
   ```bash
   docker-compose up -d --build
   ```

## Troubleshooting

- **Port Conflicts**: Ensure ports 80, 3000, and 5432 are not in use
- **Permission Issues**: Run `chmod -R 777 data` if encountering permission errors
- **Database Connection**: Verify PostgreSQL is running and accessible

## Security Considerations

- Change all default passwords in production
- Use HTTPS in production (consider using a reverse proxy like Nginx or Traefik)
- Regularly update Docker images and dependencies
- Backup the database volume regularly
