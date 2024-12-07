const fs = require("fs");
const path = require("path");
const AcademicResources = artifacts.require("AcademicResources");
const AcademicToken = artifacts.require("AcademicToken");

module.exports = async function (deployer) {
  const contract = await AcademicResources.deployed();

  const initialSupply = web3.utils.toWei("1000", "ether"); 
  await deployer.deploy(AcademicToken, initialSupply);
  const token = await AcademicToken.deployed();
  
  await deployer.deploy(AcademicResources, token.address);

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
