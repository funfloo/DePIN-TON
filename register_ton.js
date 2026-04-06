require('dotenv').config();
const { TonClient, WalletContractV4, internal, toNano, fromNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) throw new Error("MNEMONIC absent du .env");

        const client = new TonClient({ 
            endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" 
        });

        // 1. Génération de la clé et du wallet v4r2
        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const contract = client.open(wallet);

        // 2. Vérification de l'adresse et du solde
        const addr = wallet.address.toString({ testOnly: true, bounceable: false });
        const balance = await contract.getBalance();

        console.log(`\n💎 CONFIGURATION V4R2 :`);
        console.log(`📍 Adresse : ${addr}`);
        console.log(`💰 Solde actuel : ${fromNano(balance)} TON`);

        if (balance < toNano("2.08")) {
            console.log(`❌ ERREUR : Solde insuffisant (${fromNano(balance)}). Il faut au moins 2.1 TON.`);
            return;
        }

        // 3. Envoi de l'inscription (2 TON de caution + gaz)
        console.log("🔗 Envoi de l'inscription au contrat Cocoon...");
        await contract.sendTransfer({
            seqno: await contract.getSeqno(),
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                    value: toNano("2.05"), // On envoie 2.05 pour être sûr que le contrat reçoive ses 2 TON
                    body: "RegisterWorker",
                })
            ]
        });

        console.log("🚀 TRANSACTION ENVOYÉE ! Vérifie Tonscan d'ici 10 secondes.");
    } catch (e) {
        console.error("❌ ERREUR :", e.message);
    }
}
main();
