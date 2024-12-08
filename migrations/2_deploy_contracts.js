const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  const initialSupply = web3.utils.toWei("1000", "ether"); 

  await deployer.deploy(AcademicToken, initialSupply);
  const tokenInstance = await AcademicToken.deployed();

  const admin = accounts[0];

  



  // Deploy Validator
  await deployer.deploy(Validator, tokenInstance.address);
  const validatorInstance = await Validator.deployed();


  
  await deployer.deploy(AcademicResources, tokenInstance.address, validatorInstance.address);

  const contract = await AcademicResources.deployed();


  const envFilePath = path.resolve(__dirname, "../frontend/.env.local");
  const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}\n`;
  // Transfer tokens to the deployer to fund AcademicResources
  const fundingAmount = web3.utils.toWei("1000", "ether"); // 100,000 tokens
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
