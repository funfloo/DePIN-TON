import * as dotenv from 'dotenv';
dotenv.config();
import { TonClient, WalletContractV4, toNano, Address } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { DepinTask } from './DepinTask_DepinTask'; 

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) throw new Error("MNEMONIC absent du .env");

        // Connexion au réseau TON avec ta clé API
        const client = new TonClient({ 
            endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
            apiKey: "6df031fa12e11505c5785ce6f2c57e9a5bbd79a170413899aaf6cff6a0fcf167" 
        });

        // Génération du wallet V4R2
        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        
        // 🛠️ Typage strict de l'adresse du contrat
        const contractAddress = Address.parse("EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE");
        
        // Connexion au Smart Contract via le Wrapper Tact
        const depinContract = client.open(DepinTask.fromAddress(contractAddress));
        
        console.log("🔗 Envoi de l'inscription via le Wrapper Tact...");
        
        // Envoi de la transaction
        await depinContract.send(
            client.open(wallet).sender(key.secretKey),
            { value: toNano("2.05") }, // 2 TON de caution + gaz
            {
                $$type: "RegisterWorker",
                endpoint: process.argv[2] || "https://depin-node-ton.ngrok.io",
                pricePerChar: BigInt(process.argv[3] || 10)
            }
        );

        console.log("🚀 TRANSACTION ENVOYÉE ! Le Smart Contract l'analyse en ce moment.");
    } catch (e) {
        console.error("❌ ERREUR :", e);
    }
}
main();
