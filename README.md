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

(Contract calls)

Upload call:
await instance.uploadResource("Resource Name", "https://example.com/resource", { from: accounts[0] });

Report call:
await instance.reportResource('Resource id(starts at 1)', { from: accounts[0] });

Upvote call:
await instance.upvoteResource('Resource id(starts at 1)', { from: accounts[0] });

Get Resources (without report number (for students)):
await instance.getResourceWithReports(1);

Get Resources (with report number (for staff)):
await instance.getResourceWithReports(1);