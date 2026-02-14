# NetFlow
# NetFlow ISP Management Platform - Deployment Guide

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
- Docker Compose (included with Docker Desktop)

### Deployment Steps

1. **Clone and navigate to the project**
   ```bash
   cd c:/Users/rudra/Music/NetFlow
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop all services**
   ```bash
   docker-compose down
   ```

### Services Included
| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database with TimescaleDB |
| Redis | 6379 | Caching layer |
| Backend | 3001 | API server |
| Frontend | 3000 | Next.js web application |

---

## Manual Deployment (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Step 1: Install Infrastructure

**PostgreSQL with TimescaleDB:**
- Download: https://www.timescale.com/downloads
- Or use PostgreSQL standalone: https://www.postgresql.org/download/windows/

**Redis:**
- Download: https://github.com/microsoftarchive/redis/releases
- Or use WSL with Redis

### Step 2: Create Database
```sql
CREATE DATABASE netflow;
CREATE USER netflow WITH PASSWORD 'netflow_secret';
GRANT ALL PRIVILEGES ON DATABASE netflow TO netflow;
```

### Step 3: Install and Build Backend
```bash
cd c:/Users/rudra/Music/NetFlow/backend
npm install
npm run build
npm start
```

### Step 4: Install and Build Frontend
```bash
cd c:/Users/rudra/Music/NetFlow/frontend
npm install
npm run build
npm start
```

### Step 5: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=production
PORT=3001

# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=netflow
DATABASE_PASSWORD=netflow_secret
DATABASE_NAME=netflow

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
ENCRYPTION_KEY=12345678901234567890123456789012

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Docker Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Remove all data (database, cache)
docker-compose down -v
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### Container Health Issues
```bash
# Check container status
docker ps -a

# View detailed logs
docker-compose logs
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

---

## Production Considerations

1. **Change default secrets** in environment variables
2. **Enable SSL/TLS** for production
3. **Configure proper backups** for PostgreSQL
4. **Set up monitoring** for containers
5. **Use external Redis** for high availability
6. **Configure proper logging** retention policies
