#!/bin/bash
echo "🚀 RESET ET INSTALLATION COCOON TON 🚀"

# 1. Nettoyage
pm2 delete ton-worker ton-tunnel 2>/dev/null
rm -rf cocoon-ton-node

# 2. Setup
mkdir -p cocoon-ton-node && cd cocoon-ton-node
npm init -y > /dev/null
npm install @ton/ton @ton/crypto express cors dotenv > /dev/null

# 3. Download
curl -so worker.js "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/worker.js"
curl -so register_ton.js "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/register_ton.js"

# 4. Config
echo ""
read -p "🔐 Tes 24 mots TON : " MNEMONIC < /dev/tty
read -p "🌐 Domaine Ngrok (port 3001) : " NGROK_DOMAIN < /dev/tty
echo "MNEMONIC=\"$MNEMONIC\"" > .env

# 5. Launch
pm2 start "ngrok http --url=$NGROK_DOMAIN 3001" --name "ton-tunnel"
pm2 start worker.js --name "ton-worker"

# 6. Register
node register_ton.js $NGROK_DOMAIN 10
