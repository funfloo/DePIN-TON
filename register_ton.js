require('dotenv').config();
const { TonClient, WalletContractV5R1, internal, toNano, fromNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" });
        const key = await mnemonicToWalletKey(mnemonic.split(" "));

        // Tonkeeper W5 utilise souvent ces deux IDs
        const subwalletIds = [2147483649, 696618387, 0]; 
        
        console.log(`\n🔎 RECHERCHE DU WALLET CORRESPONDANT...`);
        
        for (let id of subwalletIds) {
            const wallet = WalletContractV5R1.create({ 
                publicKey: key.publicKey, 
                workchain: 0,
                subwalletId: id 
            });
            const contract = client.open(wallet);
            const balance = await contract.getBalance();
            const addr = wallet.address.toString({ testOnly: true, bounceable: false });

            console.log(`Index ${id} -> Adresse: ${addr} | Solde: ${fromNano(balance)} TON`);

            // Si l'adresse correspond à ton Tonkeeper (0QCv...)
            if (balance > toNano("0.5")) { 
                console.log(`\n✅ WALLET TROUVÉ !`);
                console.log(`🔗 Envoi de l'inscription depuis : ${addr}`);

                const seqno = await contract.getSeqno();
                await contract.sendTransfer({
                    seqno: seqno,
                    secretKey: key.secretKey,
                    messages: [
                        internal({
                            to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                            value: toNano("2.1"),
                            body: "RegisterWorker",
                        })
                    ]
                });
                console.log("🚀 TRANSACTION ENVOYÉE !");
                return;
            }
        }
        console.log("\n❌ Aucun wallet avec du solde n'a été trouvé. Vérifie l'orthographe de tes 24 mots dans le .env");
    } catch (e) {
        if (e.message.includes("429")) {
            console.error("⏳ Erreur 429 : Trop de requêtes. Attends 2 minutes avant de réessayer.");
        } else {
            console.error("❌ ERREUR :", e.message);
        }
    }
}
main();
