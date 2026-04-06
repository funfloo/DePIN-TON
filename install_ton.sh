#!/bin/bash
echo "🚀 RESET ET INSTALLATION COCOON TON (TYPESCRIPT) 🚀"

pm2 delete ton-worker ton-tunnel 2>/dev/null
rm -rf cocoon-ton-node
mkdir -p cocoon-ton-node && cd cocoon-ton-node

npm init -y > /dev/null
# On ajoute ts-node et typescript pour lire les fichiers .ts
npm install @ton/ton @ton/crypto express cors dotenv typescript ts-node > /dev/null

# Téléchargement des 3 fichiers depuis ton repo
curl -so worker.js "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/worker.js"
curl -so register_ton.ts "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/register_ton.ts"
curl -so DepinTask_DepinTask.ts "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/DepinTask_DepinTask.ts"

echo ""
read -p "🔐 Tes 24 mots TON (V4R2) : " MNEMONIC < /dev/tty
read -p "🌐 Domaine Ngrok (port 3001) : " NGROK_DOMAIN < /dev/tty
echo "MNEMONIC=\"$MNEMONIC\"" > .env

pm2 start "ngrok http --url=$NGROK_DOMAIN 3001" --name "ton-tunnel"
pm2 start worker.js --name "ton-worker"

# On utilise npx ts-node pour exécuter le TypeScript directement
npx ts-node register_ton.ts $NGROK_DOMAIN 10
