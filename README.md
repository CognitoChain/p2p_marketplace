![Dharma Relayer Kit](public/Logo-Horizontal.png)

![p2p_marketplace](public/)

PoC of a Decentralized Peer 2 Peer lending platform

# Install latest packages
yarn install

# Start Local Dev environment
```
$ yarn blockchain
$ yarn server
$ yarn start
```

# Prod build
```
$ yarn build
```

# Start JSON Service
This will start a JSON service (Express server) for the Relayer's React frontend
```
$ NETWORK=kovan [PORT=8000] yarn server
```

check if node is listening on expected port
```
$ lsof -nP -i4TCP:8000 | grep LISTEN
```

# Fund Kovan testnet account:

1. Add Ethers
```
https://github.com/kovan-testnet/faucet
```
2. Add ECR20 tokens
```
https://wallet.dharma.io
```


# The Cognito Relayer Ethereum Account (Kovan testnet)
This is the account colelcting the fees.
```
0xcdad1af8b76b77bf6ae0b30bc2413865d3fa0cdd
```


# Loan Request transaction (Kovan testnet)
```
https://kovan.etherscan.io/tx/0x49aeb2b7ec38fa81c9ce5acc005dabffff446566b0cbe4cc9a9ebd3e0fae9985
```


# Start Node Service on port 8000
```
$ NETWORK=kovan PORT=8000 yarn server
```



