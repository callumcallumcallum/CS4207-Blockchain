const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  const initialSupply = web3.utils.toWei("1000", "ether");

  await deployer.deploy(AcademicToken, initialSupply);
  const tokenInstance = await AcademicToken.deployed();

  const admin = accounts[0];

  await deployer.deploy(Validator, tokenInstance.address);
  const validatorInstance = await Validator.deployed();

  await deployer.deploy(AcademicResources, tokenInstance.address, validatorInstance.address);

  module.exports = async function (deployer, network, accounts) {
    const initialValidators = [accounts[0], accounts[1], accounts[2]];
    const approvalsNeeded = 2;

    await deployer.deploy(AcademicResources, initialValidators, approvalsNeeded);
    const contract = await AcademicResources.deployed();


    const envFilePath = path.resolve(__dirname, "../frontend/.env.local");
    const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}\n`;

    const fundingAmount = web3.utils.toWei("1000", "ether"); // 100,000 tokens
    await tokenInstance.transfer(admin, fundingAmount);

    await tokenInstance.approve(admin, fundingAmount);

    await deployer.deploy(
      AcademicResources,
      tokenInstance.address,
      validatorInstance.address
    );
    const resourcesInstance = await AcademicResources.deployed();
  };
}