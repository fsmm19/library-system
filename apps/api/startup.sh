#!/bin/bash
set -e

echo "Starting application setup..."

# Navigate to app directory
cd /home/site/wwwroot

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --production
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting NestJS application..."
node dist/main.js
