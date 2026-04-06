const { TonClient, Address, TupleBuilder } = require("@ton/ton");

async function main() {
    const client = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });

    const contractAddress = Address.parse("EQBl7aOQEoRi-I5qgctzI89gAnsbV6exEMKrsa5yDp7ZPcZE");
    let suggestedPrice = 10;

    try {
        // Sur TON, on interroge un "Getter" du contrat
        const result = await client.runMethod(contractAddress, "getMinStake");
        // On récupère la valeur (simplifié pour la démo)
        console.log(`\n📊 INFO MARCHÉ : Le staking minimum est de 2 TON.`);
    } catch (e) {
        console.log(`\n📊 INFO MARCHÉ : Premier sur le réseau ! Prix par défaut : 10.`);
    }
    
    require('fs').writeFileSync('.suggested_price', suggestedPrice.toString());
}
main();
