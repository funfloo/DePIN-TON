import * as dotenv from 'dotenv';
dotenv.config();
import { TonClient, WalletContractV4, toNano } from "@ton/ton";
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
        const contractAddress = "EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE";
        
        // On connecte le wrapper à l'adresse de ton contrat
        const depinContract = client.open(DepinTask.fromAddress(contractAddress));
        
        console.log("🔗 Envoi de l'inscription via le Wrapper Tact...");
        
        // La méthode send() s'occupe de tout le formatage binaire !
        await depinContract.send(
            client.open(wallet).sender(key.secretKey),
            { value: toNano("2.05") }, // 2 TON caution + 0.05 gaz
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
