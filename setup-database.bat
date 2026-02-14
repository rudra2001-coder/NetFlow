@echo off
REM Database Setup Script for NetFlow
REM This script creates the PostgreSQL database and user

echo ========================================
echo NetFlow Database Setup
echo ========================================
echo.

REM Check if PostgreSQL is running
sc query postgresql-x64-16 | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL service is not running!
    echo Please start PostgreSQL service first.
    pause
    exit /b 1
)

echo PostgreSQL service is running...
echo.

REM Try to find psql in common locations
set PSQL_PATH=
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe

if "%PSQL_PATH%"=="" (
    echo ERROR: Could not find psql.exe
    echo Please install PostgreSQL or add it to your PATH
    echo.
    echo You can manually create the database using pgAdmin:
    echo 1. Create database: netflow
    echo 2. Create user: netflow with password: netflow123
    echo 3. Grant all privileges on database netflow to user netflow
    pause
    exit /b 1
)

echo Found PostgreSQL at: %PSQL_PATH%
echo.

REM Create SQL commands file
echo CREATE DATABASE netflow; > %TEMP%\netflow_setup.sql
echo CREATE USER netflow WITH PASSWORD 'netflow123'; >> %TEMP%\netflow_setup.sql
echo ALTER USER netflow WITH SUPERUSER; >> %TEMP%\netflow_setup.sql
echo \c netflow >> %TEMP%\netflow_setup.sql
echo GRANT ALL ON SCHEMA public TO netflow; >> %TEMP%\netflow_setup.sql
echo ALTER SCHEMA public OWNER TO netflow; >> %TEMP%\netflow_setup.sql
echo GRANT ALL PRIVILEGES ON DATABASE netflow TO netflow; >> %TEMP%\netflow_setup.sql

echo Creating database and user...
echo.
echo You will be prompted for the PostgreSQL 'postgres' user password.
echo.

"%PSQL_PATH%" -U postgres -f %TEMP%\netflow_setup.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS: Database setup completed!
    echo ========================================
    echo.
    echo Database: netflow
    echo User: netflow
    echo Password: netflow123
    echo.
    echo You can now run: npm run db:migrate
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Database setup failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo You may need to manually create the database using pgAdmin.
    echo.
)

REM Cleanup
del %TEMP%\netflow_setup.sql

pause
