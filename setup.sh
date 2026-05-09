#!/bin/bash

# NEET AI Suite - Local Development Setup
# This script sets up the local development environment

set -e

echo "🚀 Setting up NEET AI Suite..."
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. You have v$(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is required but not installed."
    echo "   Install with: npm install -g pnpm"
    exit 1
fi

echo "✓ pnpm $(pnpm -v)"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "   ✓ .env created (using SQLite for local development)"
else
    echo "✓ .env exists"
fi

# Create data directory for SQLite
if [ ! -d data ]; then
    mkdir -p data
    echo "✓ Created data/ directory for SQLite"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Build libraries
echo ""
echo "🔨 Building libraries..."
pnpm run typecheck:libs

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development, run:"
echo "  pnpm dev:full"
echo ""
echo "This will start:"
echo "  • API server on http://localhost:3000"
echo "  • Frontend on http://localhost:4173"
echo ""
