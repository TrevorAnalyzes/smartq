#!/bin/bash

# SmartQ VPS Update Script
# Run this on your Hostinger VPS to update the application

set -e  # Exit on error

echo "🚀 SmartQ VPS Update Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/smartq"
TELEPHONY_DIR="/var/www/smartq-telephony"
PM2_APP_NAME="smartq-dashboard"
PM2_TELEPHONY_NAME="smartq-telephony"

echo -e "${YELLOW}Step 1: Checking current status...${NC}"
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"
pm2 list || echo "PM2 not running or not installed"

echo ""
echo -e "${YELLOW}Step 2: Navigating to app directory...${NC}"
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    echo "✓ Found app at $APP_DIR"
else
    echo -e "${RED}✗ App directory not found at $APP_DIR${NC}"
    echo "Please update APP_DIR variable in this script"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Checking current git status...${NC}"
git branch
echo ""
git log --oneline -3
echo ""
git status --short

echo ""
echo -e "${YELLOW}Step 4: Pulling latest changes from GitHub...${NC}"
git fetch origin
git checkout dev
git pull origin dev

echo ""
echo -e "${YELLOW}Step 5: Installing dependencies...${NC}"
npm install --production=false

echo ""
echo -e "${YELLOW}Step 6: Running Prisma migrations...${NC}"
npx prisma generate
npx prisma db push --accept-data-loss

echo ""
echo -e "${YELLOW}Step 7: Building Next.js application...${NC}"
npm run build

echo ""
echo -e "${YELLOW}Step 8: Updating telephony bridge...${NC}"
if [ -d "$TELEPHONY_DIR" ]; then
    cp -r telephony-bridge/* $TELEPHONY_DIR/
    cd $TELEPHONY_DIR
    npm install --production
    cd $APP_DIR
else
    echo "Telephony directory not found, skipping..."
fi

echo ""
echo -e "${YELLOW}Step 9: Restarting applications...${NC}"
pm2 restart $PM2_APP_NAME || echo "Failed to restart $PM2_APP_NAME"
pm2 restart $PM2_TELEPHONY_NAME || echo "Failed to restart $PM2_TELEPHONY_NAME"

echo ""
echo -e "${YELLOW}Step 10: Checking status...${NC}"
pm2 list
pm2 logs --lines 20

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Update Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "View logs:"
echo "  pm2 logs $PM2_APP_NAME"
echo "  pm2 logs $PM2_TELEPHONY_NAME"
echo ""
echo "Check status:"
echo "  pm2 status"
echo ""

