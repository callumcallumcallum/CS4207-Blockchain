import { JsonRpcProvider, BrowserProvider, Contract, parseEther } from "ethers";
import AcademicResources from "../../build/contracts/AcademicResources.json";
import AcademicToken from "../../build/contracts/AcademicToken.json";
import Validator from "../../build/contracts/Validator.json";
import Staking from "../../build/contracts/Staking.json";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const VALIDATOR_ADDRESS = process.env.NEXT_PUBLIC_VALIDATOR_ADDRESS;
const RESOURCES_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

const provider = new JsonRpcProvider(RPC_URL);

export function getContracts() {
    const tokenContract = new Contract(TOKEN_ADDRESS, AcademicToken.abi, provider);
    const validatorContract = new Contract(VALIDATOR_ADDRESS, Validator.abi, provider);
    const resourcesContract = new Contract(RESOURCES_ADDRESS, AcademicResources.abi, provider);
    const stakingContract = new Contract(STAKING_ADDRESS, Staking.abi, provider);

    return { tokenContract, validatorContract, resourcesContract, stakingContract };
}

export async function getContractsWithSigner() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();

    const tokenContract = new Contract(TOKEN_ADDRESS, AcademicToken.abi, signer);
    const validatorContract = new Contract(VALIDATOR_ADDRESS, Validator.abi, signer);
    const resourcesContract = new Contract(RESOURCES_ADDRESS, AcademicResources.abi, signer);
    const stakingContract = new Contract(STAKING_ADDRESS, Staking.abi, signer);

    return { tokenContract, validatorContract, resourcesContract, stakingContract };
}
