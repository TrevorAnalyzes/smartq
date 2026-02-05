#!/bin/bash

# Update SmartQ on VPS server
echo "Updating SmartQ on server..."

ssh root@76.13.252.202 << 'ENDSSH'
cd /var/www/smartq
echo "Switching to main branch..."
git checkout main
echo "Pulling latest changes..."
git pull origin main
echo "Restarting PM2 app..."
pm2 restart smartq-app
echo "Done!"
pm2 status
ENDSSH

