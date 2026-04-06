import * as dotenv from 'dotenv';
dotenv.config();
// Ajout de 'Address' dans les imports
import { TonClient, WalletContractV4, toNano, Address } from "@ton/ton"; 
import { mnemonicToWalletKey } from "@ton/crypto";
import { DepinTask } from './DepinTask_DepinTask'; 

async function main() {
    try {
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) throw new Error("MNEMONIC absent du .env");

        const client = new TonClient({ 
            endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
            apiKey: "6df031fa12e11505c5785ce6f2c57e9a5bbd79a170413899aaf6cff6a0fcf167" 
        });

        const key = await mnemonicToWalletKey(mnemonic.split(" "));
        const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
        
        // 🛠️ LA CORRECTION EST ICI : on utilise Address.parse()
        const contractAddress = Address.parse("EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE");
        const depinContract = client.open(DepinTask.fromAddress(contractAddress));
        
        console.log("🔗 Envoi de l'inscription via le Wrapper Tact...");
        
        await depinContract.send(
            client.open(wallet).sender(key.secretKey),
            { value: toNano("2.05") },
            {
                $$type: "RegisterWorker",
                endpoint: process.argv[2] || "https://depin-node-ton.ngrok.io",
                pricePerChar: BigInt(process.argv[3] || 10)
            }
        );

        console.log("🚀 TRANSACTION ENVOYÉE ! Le Smart Contract va maintenant l'accepter.");
    } catch (e) {
        console.error("❌ ERREUR :", e);
    }
}
main();
