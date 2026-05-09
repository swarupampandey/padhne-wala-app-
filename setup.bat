@echo off
REM NEET AI Suite - Local Development Setup (Windows)
REM This script sets up the local development environment

setlocal enabledelayedexpansion

echo.
echo 🚀 Setting up NEET AI Suite...
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo    Download from: https://nodejs.org/
    exit /b 1
)

for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%

REM Check pnpm
where pnpm >nul 2>nul
if errorlevel 1 (
    echo ❌ pnpm is required but not installed.
    echo    Install with: npm install -g pnpm
    exit /b 1
)

for /f "tokens=*" %%i in ('pnpm -v') do set PNPM_VERSION=%%i
echo ✓ pnpm %PNPM_VERSION%

REM Create .env if it doesn't exist
if not exist .env (
    echo.
    echo 📝 Creating .env from .env.example...
    copy .env.example .env >nul
    echo    ✓ .env created (using SQLite for local development)
) else (
    echo ✓ .env exists
)

REM Create data directory for SQLite
if not exist data (
    mkdir data
    echo ✓ Created data\ directory for SQLite
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call pnpm install
if errorlevel 1 exit /b 1

REM Build libraries
echo.
echo 🔨 Building libraries...
call pnpm run typecheck:libs
if errorlevel 1 exit /b 1

echo.
echo ✅ Setup complete!
echo.
echo To start development, run:
echo   pnpm dev:full
echo.
echo This will start:
echo   * API server on http://localhost:3000
echo   * Frontend on http://localhost:4173
echo.
