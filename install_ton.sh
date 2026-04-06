#!/bin/bash
echo "🚀 RESET ET INSTALLATION COCOON TON (TYPESCRIPT & TSX) 🚀"

# 1. Nettoyage
pm2 delete ton-worker ton-tunnel 2>/dev/null
rm -rf cocoon-ton-node
mkdir -p cocoon-ton-node && cd cocoon-ton-node

# 2. Installation des dépendances (avec tsx !)
npm init -y > /dev/null
npm install @ton/ton @ton/crypto express cors dotenv typescript tsx > /dev/null

# 3. Téléchargement des fichiers depuis GitHub
curl -so worker.js "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/worker.js"
curl -so register_ton.ts "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/register_ton.ts"
curl -so DepinTask_DepinTask.ts "https://raw.githubusercontent.com/funfloo/DePIN-TON/main/DepinTask_DepinTask.ts"

# 4. Configuration
echo ""
read -p "🔐 Tes 24 mots TON (V4R2) : " MNEMONIC < /dev/tty
read -p "🌐 Domaine Ngrok (port 3001) : " NGROK_DOMAIN < /dev/tty
echo "MNEMONIC=\"$MNEMONIC\"" > .env

# 5. Lancement des processus PM2
pm2 start "ngrok http --url=$NGROK_DOMAIN 3001" --name "ton-tunnel"
pm2 start worker.js --name "ton-worker"

# 6. Exécution de l'enregistrement avec tsx
npx tsx register_ton.ts $NGROK_DOMAIN 10
