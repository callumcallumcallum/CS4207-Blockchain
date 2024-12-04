import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL
);
const contractABI = require("../../build/contracts/AcademicResources.json");
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const getContract = () => {
  return new ethers.Contract(contractAddress, contractABI.abi, provider);
};
