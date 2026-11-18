Numista Coin testnet - Windows x64 preview

This package contains the Numista testnet daemon and command-line software
wallet. It is an experimental, isolated development network, not mainnet.
There are no public Numista peers, and NFT minting/transfers are not
implemented. Do not use it to hold value.

The wallet CLI supports ordinary software wallets. Trezor hardware-wallet
integration is not included in this build. No wallet files, seeds, or keys
are included.

## Start the Numista testnet node

Open PowerShell in the folder containing the extracted files and run this
exact command:

```powershell
  .\monerod.exe --testnet --offline
```

Do not run `.\monerod.exe` without `--testnet`: that starts Monero mainnet.
Keep the node window open. In another PowerShell window, verify the network:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:48081/get_info' |
  Format-List nettype,testnet,offline,height
```

Expected: `nettype` is `testnet`, `testnet` is `True`, and `offline` is
`True`. The testnet RPC port is `48081`; port `18081` is Monero mainnet.

## Create or open a wallet

In another PowerShell window, create a new Numista testnet software wallet:

```powershell
.\monero-wallet-cli.exe --testnet --generate-new-wallet .\numista-wallet --daemon-address 127.0.0.1:48081
```

To open that wallet again later:

```powershell
.\monero-wallet-cli.exe --testnet --wallet-file .\numista-wallet --daemon-address 127.0.0.1:48081
```

At the wallet prompt, use:

```text
address
refresh
balance
```

Keep the wallet password, mnemonic seed, and private keys private and backed
up. Coinbase mining rewards take 60 blocks to unlock.

## Mine to your wallet

While the wallet is open, copy the address shown by its `address` command.
In a PowerShell window, replace `PASTE_ADDRESS_FROM_WALLET` below with that
address (without angle brackets):

```powershell
$body = @{
  miner_address = 'GrADFPzDJL77E74h7NLpieT3eWZVcsmUJLiCLEq3WFpSHAWsoYiyf868BtNAKKTbUmjh2sBJYq6ZcE5cVWcfXWcvA98DFmd'
  threads_count = 1
  do_background_mining = $false
  ignore_battery = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://127.0.0.1:48081/start_mining' `
  -Method Post -ContentType 'application/json' -Body $body
```

Check mining status:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:48081/mining_status' `
  -Method Post -ContentType 'application/json' -Body '{}'
```

Stop mining:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:48081/stop_mining' `
  -Method Post -ContentType 'application/json' -Body '{}'
```

The testnet uses P2P port 48080 and local daemon RPC port 48081. The node is
started with `--offline`, so it does not connect to peers. If logs show a
public peer or RPC port `18081`, stop the daemon with Ctrl+C and restart it
with the exact testnet command above.

These binaries were cross-compiled for Windows x64. They have not yet been
executed on a Windows host; please report any startup or wallet connection
errors.

The archive also includes numista-source.patch for the Numista-specific source
changes applied to upstream Monero commit dfa1a30d3. The GitHub release tag is
a download tag; the patch is needed to reproduce these binaries from source.
From a checkout of that exact upstream commit, apply the patch at the source
root with:

  git apply numista-source.patch
