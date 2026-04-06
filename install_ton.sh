#!/bin/bash

echo "=================================================="
echo "🚀 INITIALISATION DU NŒUD COCOON TON 🚀"
echo "=================================================="

# 1. Installations de base (Node, Ollama)
if ! command -v node &> /dev/null; then
    echo "📦 Installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
    apt-get install -y nodejs > /dev/null
fi

if ! command -v ollama &> /dev/null; then
    echo "🧠 Installation d'Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh > /dev/null
fi

# 2. Démarrage IA
ollama serve > /dev/null 2>&1 &
sleep 5
ollama pull mistral

# 3. Setup Dossier
mkdir -p cocoon-ton-node && cd cocoon-ton-node
npm init -y > /dev/null
npm install @ton/ton @ton/crypto express cors dotenv > /dev/null
npm install -g pm2 ngrok > /dev/null

# 4. Configuration
echo ""
read -p "🔐 Tes 24 mots TON (séparés par des espaces) : " MNEMONIC < /dev/tty
read -p "🔐 Authtoken Ngrok : " NGROK_TOKEN < /dev/tty
read -p "🌐 Domaine fixe Ngrok : " NGROK_DOMAIN < /dev/tty

echo "MNEMONIC=\"$MNEMONIC\"" > .env
ngrok config add-authtoken $NGROK_TOKEN > /dev/null

# 5. Lancement
pm2 start "ngrok http --url=$NGROK_DOMAIN 3000" --name "ton-tunnel"
pm2 start worker.js --name "ton-worker"

# 6. Inscription Blockchain
node register_ton.js $NGROK_DOMAIN 10

echo "=================================================="
echo "✅ TON NODE ACTIF ! CAUTION DÉPOSÉE."
echo "=================================================="
