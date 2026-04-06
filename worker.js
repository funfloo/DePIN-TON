require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// L'adresse de ton Smart Contract TON sur le Testnet
const TON_CONTRACT_ADDRESS = "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE";

// 1. Fonction pour vérifier le paiement sur la blockchain TON
async function verifyTonPayment() {
    try {
        const response = await fetch(`https://testnet.toncenter.com/api/v2/getTransactions?address=${TON_CONTRACT_ADDRESS}&limit=1`);
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
            // Logique simplifié pour le POC : On valide si une transaction récente existe
            return true;
        }
        return false;
    } catch (e) {
        console.error("Erreur de connexion à l'API TON:", e);
        return false;
    }
}

// 2. API de génération
app.post('/api/generate', async (req, res) => {
    const { taskId, prompt } = req.body;

    console.log(`\n🚀 Requête reçue pour le Prompt: "${prompt}"`);

    try {
        // Vérification Blockchain
        const isPaid = await verifyTonPayment();
        if (!isPaid) {
            return res.status(402).json({ error: "Paiement non confirmé sur TON." });
        }

        // Appel Ollama local
        const ollamaResponse = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "mistral",
                prompt: prompt,
                stream: false
            })
        });

        const ollamaData = await ollamaResponse.json();
        
        res.json({
            success: true,
            response: ollamaData.response,
            txHash: "Verified_On_TON_Blockchain"
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur technique du nœud." });
    }
});

app.listen(3000, () => console.log(`🟢 Worker TON actif sur le port 3000`));
