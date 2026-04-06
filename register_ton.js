const { TonClient, WalletContractV4, internal, Address, toNano } = require("@ton/ton");
const { mnemonicToWalletKey } = require("@ton/crypto");

async function main() {
    const mnemonic = process.env.MNEMONIC; // 24 mots
    const endpoint = process.argv[2];
    const price = process.argv[3];

    const client = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC" });
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const contract = client.open(wallet);

    console.log("🔗 Signature de l'inscription sur TON...");
    
    // On envoie 2.1 TON (2 de caution + 0.1 de frais)
    await contract.sendTransfer({
        seqno: await contract.getSeqno(),
        secretKey: key.secretKey,
        messages: [
            internal({
                to: "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE",
                value: toNano("2.1"),
                body: "RegisterWorker", // Simplifié : Tact gère les commentaires ou les payloads
            })
        ]
    });
    console.log("✅ Requête d'inscription envoyée au réseau TON !");
}
main();
