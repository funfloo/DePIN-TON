require('dotenv').config();
const { TonClient, WalletContractV4, WalletContractV5R1, internal, toNano, fromNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" });
        const key = await mnemonicToWalletKey(mnemonic.split(" "));

        // 1. On teste la version V4R2 (Standard)
        const v4 = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const v4Contract = client.open(v4);
        const v4Balance = await v4Contract.getBalance();

        // 2. On teste la version V5R1 (Le "W5" de Tonkeeper)
        const v5 = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });
        const v5Contract = client.open(v5);
        const v5Balance = await v5Contract.getBalance();

        console.log(`\n🔎 RECHERCHE DE TON WALLET :`);
        console.log(`-----------------------------------------`);
        console.log(`Wallet V4R2 : ${v4.address.toString({ testOnly: true, bounceable: false })}`);
        console.log(`💰 Solde V4R2 : ${fromNano(v4Balance)} TON`);
        console.log(`-----------------------------------------`);
        console.log(`Wallet V5R1 (W5) : ${v5.address.toString({ testOnly: true, bounceable: false })}`);
        console.log(`💰 Solde V5R1 : ${fromNano(v5Balance)} TON`);
        console.log(`-----------------------------------------`);

        // On choisit celui qui a de l'argent
        let activeContract = null;
        let activeKey = key;

        if (v5Balance > toNano("2.1")) {
            activeContract = v5Contract;
            console.log("✅ Utilisation du Wallet V5R1 détecté.");
        } else if (v4Balance > toNano("2.1")) {
            activeContract = v4Contract;
            console.log("✅ Utilisation du Wallet V4R2 détecté.");
        } else {
            console.log("❌ ERREUR : Aucun solde trouvé sur V4 ou V5. Vérifie tes 24 mots.");
            return;
        }

        console.log("🔗 Envoi de l'inscription au contrat Cocoon...");
        await activeContract.sendTransfer({
            seqno: await activeContract.getSeqno(),
            secretKey: activeKey.secretKey,
            messages: [
                internal({
                    to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                    value: toNano("2.1"),
                    body: "RegisterWorker",
                })
            ]
        });

        console.log("🚀 TRANSACTION ENVOYÉE !");
    } catch (e) {
        console.error("❌ ERREUR :", e.message);
    }
}
main();
