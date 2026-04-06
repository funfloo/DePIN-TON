require('dotenv').config();
const { TonClient, WalletContractV4, WalletContractV5R1, internal, toNano, fromNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) throw new Error("MNEMONIC manquant dans le .env");

        const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" });
        const key = await mnemonicToWalletKey(mnemonic.split(" "));

        // Test des deux versions les plus communes sur TON
        const v4 = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        const v4Contract = client.open(v4);
        const v4Balance = await v4Contract.getBalance();

        const v5 = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });
        const v5Contract = client.open(v5);
        const v5Balance = await v5Contract.getBalance();

        console.log(`\n🔎 ANALYSE DES WALLETS :`);
        console.log(`Wallet V4R2 : ${v4.address.toString({ testOnly: true, bounceable: false })} | Solde : ${fromNano(v4Balance)} TON`);
        console.log(`Wallet V5R1 (W5) : ${v5.address.toString({ testOnly: true, bounceable: false })} | Solde : ${fromNano(v5Balance)} TON`);

        let activeContract = (v5Balance > v4Balance) ? v5Contract : v4Contract;
        
        if (await activeContract.getBalance() < toNano("2.1")) {
            throw new Error("Solde insuffisant sur V4 et V5.");
        }

        console.log(`✅ Utilisation de l'adresse : ${activeContract.address.toString()}`);
        
        await activeContract.sendTransfer({
            seqno: await activeContract.getSeqno(),
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                    value: toNano("2.1"),
                    body: "RegisterWorker",
                })
            ]
        });

        console.log("🚀 TRANSACTION D'INSCRIPTION ENVOYÉE !");
    } catch (e) {
        console.error("❌ ERREUR :", e.message);
    }
}
main();
