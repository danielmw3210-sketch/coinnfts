# Numista Coin

Numista Coin is being built as a native Monero fork. The existing Solana NFT
minting example is retained separately; it is not the Numista chain.

## Current status

The `monero-core/` directory contains the official Monero source. Its testnet
configuration is isolated for Numista development with a distinct network ID,
genesis nonce, address prefixes, ports, and accelerated upstream hard-fork
schedule. This is a development network, not a production mainnet.

Native NFT minting and transfer support is not implemented yet. NFT metadata
alone is insufficient: consensus must enforce unique token IDs and private,
asset-aware ownership transfers. Do not treat this fork as supporting NFTs or
use it to hold value until those consensus and wallet changes are implemented
and reviewed.

## Build and run the development chain

Initialize the source dependencies and build Monero:

```sh
cd monero-core
git submodule update --init --recursive
cmake -S . -B build/numista-release -D CMAKE_BUILD_TYPE=Release
cmake --build build/numista-release --parallel 1
```

Run the isolated Numista development network:

```sh
build/numista-release/bin/monerod --testnet
```

The matching wallet must also use `--testnet`. Its data lives in the Numista
testnet subdirectory and its default P2P/RPC/ZMQ ports are `48080`, `48081`,
and `48082`.
