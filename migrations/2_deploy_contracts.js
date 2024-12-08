const AcademicToken = artifacts.require("AcademicToken");
const Validator = artifacts.require("Validator");
const AcademicResources = artifacts.require("AcademicResources");
const Staking = artifacts.require("Staking");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  const initialSupply = web3.utils.toWei("1000", "ether");
  const admin = accounts[0];

  await deployer.deploy(AcademicToken, initialSupply);
  const tokenInstance = await AcademicToken.deployed();
  console.log(`AcademicToken deployed at ${tokenInstance.address}`);

  await deployer.deploy(Validator, tokenInstance.address);
  const validatorInstance = await Validator.deployed();
  console.log(`Validator deployed at ${validatorInstance.address}`);
  await deployer.deploy(Staking, tokenInstance.address, web3.utils.toWei("0.01", "ether")  , validatorInstance.address);
  const stakingInstance = await Staking.deployed();

  await deployer.deploy(AcademicResources, tokenInstance.address, validatorInstance.address, stakingInstance.address);
  const resourcesInstance = await AcademicResources.deployed();

  console.log(`AcademicResources deployed at ${resourcesInstance.address}`);

  const fundingAmount = web3.utils.toWei("500", "ether");
  await tokenInstance.transfer(resourcesInstance.address, fundingAmount);
  console.log(`Transferred ${fundingAmount} tokens to AcademicResources`);

  const envFilePath = path.resolve(__dirname, "../frontend/.env.local");
  const envContent = `
      NEXT_PUBLIC_TOKEN_ADDRESS=${tokenInstance.address}
      NEXT_PUBLIC_VALIDATOR_ADDRESS=${validatorInstance.address}
      NEXT_PUBLIC_CONTRACT_ADDRESS=${resourcesInstance.address}
    `;

  require("fs").writeFileSync(envFilePath, envContent.trim());
  console.log(`Environment variables written to ${envFilePath}`);
};
