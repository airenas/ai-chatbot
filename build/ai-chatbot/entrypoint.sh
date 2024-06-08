#!/bin/sh
echo "Starting AI Chatbot"
echo "Set base path to $BASE_PATH"
sed -i "s|^NEXT_PUBLIC_BASE_PATH=.*|NEXT_PUBLIC_BASE_PATH=$BASE_PATH|" .env
sed -i "s|/__PATH_PREFIX__|$BASE_PATH|g" server.js
find .next -type f -exec sed -i "s|/__PATH_PREFIX__|$BASE_PATH|g" {} +
echo "Set base path to $BASE_PATH done"

echo "Starting node service"
HOSTNAME=0.0.0.0 node server.js
