require('dotenv').config();
const { TonClient, WalletContractV4, internal, toNano, fromNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) throw new Error("MNEMONIC absent du .env");

        // Ajout de la clé API pour contourner la limite de Vast.ai
        const client = new TonClient({ 
            endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
            apiKey: "6df031fa12e11505c5785ce6f2c57e9a5bbd79a170413899aaf6cff6a0fcf167" 
        });

        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);

        const addr = wallet.address.toString({ testOnly: true, bounceable: false });
        const balance = await contract.getBalance();

        console.log(`\n💎 CONFIGURATION V4R2 (Avec API Key) :`);
        console.log(`📍 Adresse : ${addr}`);
        console.log(`💰 Solde actuel : ${fromNano(balance)} TON`);

        if (balance < toNano("2.08")) {
            console.log(`❌ ERREUR : Solde insuffisant (${fromNano(balance)}). Il faut au moins 2.1 TON.`);
            return;
        }

        console.log("🔗 Envoi de l'inscription au contrat Cocoon...");
        await contract.sendTransfer({
            seqno: await contract.getSeqno(),
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                    value: toNano("2.05"), 
                    body: "RegisterWorker",
                })
            ]
        });

        console.log("🚀 TRANSACTION ENVOYÉE ! Le réseau TON la traite en ce moment même.");
    } catch (e) {
        console.error("❌ ERREUR :", e.message);
    }
}
main();
