const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");

module.exports = async function (deployer, network, accounts) {
  const admin = accounts[0];

  // Deploy AcademicToken
  await deployer.deploy(AcademicToken);
  const tokenInstance = await AcademicToken.deployed();

  // Deploy Validator
  await deployer.deploy(Validator, tokenInstance.address);
  const validatorInstance = await Validator.deployed();

  // Transfer tokens to the deployer to fund AcademicResources
  const fundingAmount = web3.utils.toWei("100000", "ether"); // 100,000 tokens
  await tokenInstance.transfer(admin, fundingAmount);

  // Approve the AcademicResources contract to pull tokens from deployer
  await tokenInstance.approve(admin, fundingAmount);

  // Deploy AcademicResources
  await deployer.deploy(
    AcademicResources,
    tokenInstance.address,
    validatorInstance.address
  );
  const resourcesInstance = await AcademicResources.deployed();
};
