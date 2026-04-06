require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TON_CONTRACT_ADDRESS = "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE";

async function verifyTonPayment() {
    try {
        const response = await fetch(`https://testnet.toncenter.com/api/v2/getTransactions?address=${TON_CONTRACT_ADDRESS}&limit=1`);
        const data = await response.json();
        return data.ok && data.result.length > 0;
    } catch (e) {
        return false;
    }
}

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    try {
        if (!await verifyTonPayment()) return res.status(402).json({ error: "Paiement TON non trouvé" });

        const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "mistral", prompt: prompt, stream: false })
        });
        const data = await ollamaRes.json();
        res.json({ success: true, response: data.response });
    } catch (e) {
        res.status(500).json({ error: "Erreur technique" });
    }
});

app.listen(3001, () => console.log(`🟢 Worker TON actif sur le port 3001`));
