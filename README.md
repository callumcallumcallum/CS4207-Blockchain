After installing ganache:
Click quick start (can be acessed at http://127.0.0.1:7545/ )

with node version 18 run these in terminal:
npm install -g ganache
npm install -g truffle
ganache (can be accessed at http://127.0.0.1:8545/ )
truffle init
truffle compile (compiles contract)
truffle migrate --reset --network development (deploys contract to ganache)
truffle console --network development (opens truffle console to interact with contract)
