import { JsonRpcProvider, Contract } from "ethers";

if (!process.env.NEXT_PUBLIC_RPC_URL || !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error("Environment variables NEXT_PUBLIC_RPC_URL and NEXT_PUBLIC_CONTRACT_ADDRESS must be defined.");
}

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

const contractABI = require("../../build/contracts/AcademicResources.json");
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function getContract() {
  return new Contract(contractAddress, contractABI.abi, provider);
}
