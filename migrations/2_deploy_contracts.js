const fs = require("fs");
const path = require("path");
const AcademicResources = artifacts.require("AcademicResources");

module.exports = async function (deployer, network, accounts) {
  const initialValidators = [accounts[0], accounts[1], accounts[2]];
  const approvalsNeeded = 2;

  await deployer.deploy(AcademicResources, initialValidators, approvalsNeeded);
  const contract = await AcademicResources.deployed();

  const envFilePath = path.resolve(__dirname, "../frontend/.env.local");
  const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.address}\n`;

  if (fs.existsSync(envFilePath)) {
    const existingContent = fs.readFileSync(envFilePath, "utf8");
    const updatedContent = existingContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      envContent
    );
    fs.writeFileSync(envFilePath, updatedContent);
  } else {
    fs.writeFileSync(envFilePath, envContent);
  }

  console.log(`Contract deployed at address: ${contract.address}`);
  console.log(`Address saved to ${envFilePath}`);
};
