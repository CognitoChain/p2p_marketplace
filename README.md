![Dharma Relayer Kit](public/Logo-Horizontal.png)

![p2p_marketplace](public/)
Decntralized Peer 2 Peer lending platform


# Cognito DHARMA Prototype

https://github.com/dharmaprotocol/relayer-kit
 
# Start Local Dev environment
$ yarn blockchain
$ yarn server
$ yarn start

# Prod build
$ yarn build

Starts a json-server (Express server) instance to serve JSON service for Relayer and react frontend
$ NETWORK=kovan [PORT=8000] yarn server

check if node is listening on expected port
$ lsof -nP -i4TCP:8000 | grep LISTEN

# Fund Kovan testnet account
https://github.com/kovan-testnet/faucet
https://wallet.dharma.io/


# Cognito Relayer Account (Kovan testnet)
0xcdad1af8b76b77bf6ae0b30bc2413865d3fa0cdd


# Loan Request transaction (Kovan testnet)
https://kovan.etherscan.io/tx/0x49aeb2b7ec38fa81c9ce5acc005dabffff446566b0cbe4cc9a9ebd3e0fae9985



# Start Service on port 8000
$ NETWORK=kovan PORT=8000 yarn server

#  Access Service in AWS
http://18.130.225.164/
http://ec2-18-130-225-164.eu-west-2.compute.amazonaws.com/


