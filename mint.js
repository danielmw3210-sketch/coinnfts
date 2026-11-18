const { Connection, clusterApiUrl, Keypair } = require("@solana/web3.js");
const { Metaplex, keypairIdentity } = require("@metaplex-foundation/js");
const fs = require("fs");

async function main() {
  const secretKey = JSON.parse(
    fs.readFileSync(
      process.env.HOME + "/.config/solana/id.json",
      "utf8"
    )
  );

  const wallet = Keypair.fromSecretKey(
    Uint8Array.from(secretKey)
  );

  const connection = new Connection(
    clusterApiUrl("devnet")
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet));

  const { nft } = await metaplex.nfts().create({
    uri: "https://gateway.pinata.cloud/ipfs/bafkreigupntga623xddr4z2tsyu3fvvmqwnrqcdjxef6zjrmrc2xswx2m4",
    name: "1911 Penny",
    sellerFeeBasisPoints: 0,
  });

  console.log("NFT Minted!");
  console.log(nft.address.toString());
}

main().catch(console.error);