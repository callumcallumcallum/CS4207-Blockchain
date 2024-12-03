
//deploys the contract to Ganache, and the deployed contract’s address will be displayed in the terminal.
const AcademicResources = artifacts.require("AcademicResources");

module.exports = function (deployer) {
    deployer.deploy(AcademicResources);
};