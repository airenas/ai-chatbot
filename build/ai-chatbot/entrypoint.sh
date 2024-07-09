#!/bin/sh
echo "Starting AI Chatbot"
echo "Set base path to $BASE_PATH"
sed -i "s|^NEXT_PUBLIC_BASE_PATH=.*|NEXT_PUBLIC_BASE_PATH=$BASE_PATH|" .env
sed -i "s|/__PATH_PREFIX__|$BASE_PATH|g" server.js
find .next -type f -exec sed -i "s|/__PATH_PREFIX__|$BASE_PATH|g" {} +
echo "Set base path to $BASE_PATH done"

sed -i "s|^NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=$WS_URL|" .env
sed -i "s|/__WS_URL__|$WS_URL|g" server.js
find .next -type f -exec sed -i "s|/__WS_URL__|$WS_URL|g" {} +
echo "Set ws url to $WS_URL done"

sed -i "s|^NEXT_PUBLIC_BOT_URL=.*|NEXT_PUBLIC_BOT_URL=$BOT_URL|" .env
sed -i "s|/__BOT_URL__|$BOT_URL|g" server.js
find .next -type f -exec sed -i "s|/__BOT_URL__|$BOT_URL|g" {} +
echo "Set bot url to $BOT_URL done"

echo "Starting node service"
HOSTNAME=0.0.0.0 node server.js
