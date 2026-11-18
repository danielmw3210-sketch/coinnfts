add # Numista Coin testnet operator guide

Numista is an isolated development testnet, not a production network. It has no
public peer list or public seed nodes. NFT minting and transfers are not
implemented.

## Wallet details

- Network: Numista testnet (`--testnet`)
- Wallet file: `monero-core/numista-miner`
- Mining address: `Gt2AXeyZZ6DZn1tpMo6hS77cJ4BBQKTgSRfREqKkBBFcaqbkiEgh4QYMaFg7QfpY8852LfVyRmFfJHZu4CEqFUanCPvZjvN`
- Local daemon RPC: `127.0.0.1:48081`
- P2P port: `48080`

Never put the wallet password, mnemonic seed, or private keys in this document,
source control, or a terminal command. Keep the wallet files backed up and
private.

The last observed daemon height was 6. The wallet had not synchronized, so its
balance was not verified. Coinbase mining rewards require 60 blocks to unlock.

## Build Linux daemon and wallet

From the repository root:

```sh
cd /workspaces/coinnfts/monero-core
git submodule update --init --recursive
cmake -S . -B build/numista-release -D CMAKE_BUILD_TYPE=Release
cmake --build build/numista-release --target daemon wallet --parallel 2
```

## Run a local offline testnet node

In terminal 1, from `monero-core`:

```sh
./build/numista-release/bin/monerod --testnet --offline
```

`--offline` prevents P2P connections. The daemon RPC is available only on the
local machine by default. In another terminal, check the node:

```sh
curl --fail --silent --show-error http://127.0.0.1:48081/get_info
```

## Mine to the testnet wallet

Start mining through the local RPC in terminal 2:

```sh
curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  -d '{"miner_address":"Gt2AXeyZZ6DZn1tpMo6hS77cJ4BBQKTgSRfREqKkBBFcaqbkiEgh4QYMaFg7QfpY8852LfVyRmFfJHZu4CEqFUanCPvZjvN","threads_count":1,"do_background_mining":false,"ignore_battery":true}' \
  http://127.0.0.1:48081/start_mining
```

Confirm mining status:

```sh
curl --fail --silent --show-error -X POST \
  http://127.0.0.1:48081/mining_status
```

Stop mining:

```sh
curl --fail --silent --show-error -X POST \
  http://127.0.0.1:48081/stop_mining
```

## Check the wallet balance

In terminal 3, from `monero-core`:

```sh
./build/numista-release/bin/monero-wallet-cli \
  --testnet \
  --wallet-file numista-miner \
  --daemon-address 127.0.0.1:48081
```

At the wallet prompt:

```text
refresh
balance
```

Exit with `exit`. A zero balance before synchronization or before coinbase
outputs unlock is not evidence that mining failed.

## Windows x64 build

The Windows x64 daemon and command-line software wallet are available in the
[public testnet prerelease](https://github.com/danielmw3210-sketch/coinnfts/releases/tag/numista-testnet-win64-preview-20261118).
The binaries were cross-compiled but have not yet been run on a Windows host.
Trezor hardware-wallet integration is disabled; ordinary software wallets are
supported. The release includes the source patch and a SHA-256 checksum.

In PowerShell, start the node with the testnet flags (do not launch
`monerod.exe` without them, or it will use Monero mainnet):

```powershell
.\monerod.exe --testnet --offline
```

Verify the node from another PowerShell window:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:48081/get_info' |
  Format-List nettype,testnet,offline,height
```

Create a wallet:

```powershell
.\monero-wallet-cli.exe --testnet --generate-new-wallet .\numista-wallet --daemon-address 127.0.0.1:48081
```

Reopen it later with:

```powershell
.\monero-wallet-cli.exe --testnet --wallet-file .\numista-wallet --daemon-address 127.0.0.1:48081
```

At the wallet prompt, `address` displays the receive address; `refresh` scans
the chain and `balance` displays the synchronized balance. To mine, use that
testnet address in this PowerShell request, without angle brackets:

```powershell
$body = @{
  miner_address = 'PASTE_ADDRESS_FROM_WALLET'
  threads_count = 1
  do_background_mining = $false
  ignore_battery = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://127.0.0.1:48081/start_mining' `
  -Method Post -ContentType 'application/json' -Body $body
```

Use `/mining_status` and `/stop_mining` with the same local RPC and `-Method
Post -ContentType 'application/json' -Body '{}'`. Coinbase rewards unlock
after 60 blocks. `--offline` prevents peer connections, so this is a local
test chain only.

To reproduce the build on Debian/Ubuntu, use the upstream Monero `depends`
toolchain. Install the cross-compiler and Rust Windows target first:

```sh
sudo apt update
sudo apt install build-essential cmake g++-mingw-w64-x86-64
rustup target add x86_64-pc-windows-gnu
```

If needed, select the POSIX MinGW compiler alternatives:

```sh
sudo update-alternatives --set x86_64-w64-mingw32-g++ \
  "$(command -v x86_64-w64-mingw32-g++-posix)"
sudo update-alternatives --set x86_64-w64-mingw32-gcc \
  "$(command -v x86_64-w64-mingw32-gcc-posix)"
```

From the `monero-core` directory, build the Windows dependencies and binaries:

```sh
make -C contrib/depends HOST=x86_64-w64-mingw32 -j4
cmake -S . -B build/numista-windows \
  -D CMAKE_BUILD_TYPE=Release \
  -D CMAKE_TOOLCHAIN_FILE="$PWD/contrib/depends/x86_64-w64-mingw32/share/toolchain.cmake" \
  -D USE_DEVICE_TREZOR=OFF
cmake --build build/numista-windows --target daemon simplewallet --parallel 2
```

The outputs are `build/numista-windows/bin/monerod.exe` and
`build/numista-windows/bin/monero-wallet-cli.exe`. Use only testnet wallets;
NFT minting and transfers are not implemented.
