@echo off
REM NetFlow ISP Management Platform - Deployment Script for Windows
REM This script deploys the application without Docker

echo ============================================
echo NetFlow ISP Management Platform Deployment
echo ============================================

REM Check for required tools
echo [1/6] Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    exit /b 1
)

echo Prerequisites check passed.

REM Install PostgreSQL and Redis (if not available)
echo [2/6] Setting up infrastructure services...

echo Note: PostgreSQL and Redis must be installed separately or use Docker Desktop
echo For Windows, you can download PostgreSQL from: https://www.postgresql.org/download/windows/
echo For Redis, you can download from: https://github.com/microsoftarchive/redis/releases

REM Backend setup
echo [3/6] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    exit /b 1
)
cd ..

REM Frontend setup
echo [4/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)
cd ..

REM Build applications
echo [5/6] Building applications...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed
    exit /b 1
)
cd ..

cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    exit /b 1
)
cd ..

REM Create environment configuration
echo [6/6] Creating environment configuration...

if not exist .env (
    echo # NetFlow Environment Configuration > .env
    echo NODE_ENV=production >> .env
    echo PORT=3001 >> .env
    echo DATABASE_HOST=localhost >> .env
    echo DATABASE_PORT=5432 >> .env
    echo DATABASE_USER=netflow >> .env
    echo DATABASE_PASSWORD=netflow_secret >> .env
    echo DATABASE_NAME=netflow >> .env
    echo REDIS_HOST=localhost >> .env
    echo REDIS_PORT=6379 >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> .env
    echo JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production >> .env
    echo ENCRYPTION_KEY=12345678901234567890123456789012 >> .env
    echo NEXT_PUBLIC_API_URL=http://localhost:3001 >> .env
    echo. >> .env
    echo Environment file created: .env
)

echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo To run the application:
echo.
echo 1. Start PostgreSQL and Redis services
echo 2. Run backend: cd backend && npm start
echo 3. Run frontend: cd frontend && npm start
echo.
echo Access the application:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo.
echo For Docker deployment (recommended for production):
echo 1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
echo 2. Run: docker-compose up -d
echo.

pause
