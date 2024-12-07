module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // Default Ganache port
      network_id: "*", // Match any network ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Ensure this matches your Solidity version
    },
  },
};
