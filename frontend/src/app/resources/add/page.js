"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../../build/contracts/AcademicResources.json";
import ValidatorABI from "../../../../../build/contracts/Validator.json";
import TokenABI from "../../../../../build/contracts/AcademicToken.json";

export default function AddResourcePage() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const createStake = async () => {
        console.log("Starting stake process...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        console.log("Token Contract Address:", process.env.NEXT_PUBLIC_TOKEN_ADDRESS);
        const tokenContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
            TokenABI.abi,
            signer
        );

        console.log("Approving tokens...");
        const approvalTx = await tokenContract.approve(
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            10^18
        );
        await approvalTx.wait();
        console.log("Tokens approved.");

        console.log("Staking tokens...");
        const validatorContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            ValidatorABI.abi,
            signer
        );

        const stakeTx = await validatorContract.stakeTokens(10^18);
        await stakeTx.wait();
        console.log("Tokens staked successfully.");
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!name || !url) {
                throw new Error("Both name and URL are required.");
            }

            if (typeof window.ethereum === "undefined") {
                throw new Error("MetaMask is not installed.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                AcademicResourcesABI.abi,
                signer
            );

            const tx = await contract.uploadResource(name, url);
            await tx.wait();

            setSuccess(true);
            setName("");
            setUrl("");
        } catch (error) {
            console.error("Error uploading resource:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        createStake()
    }, [])

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Add a New Resource</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
            >
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                        Resource Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter the resource name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300">
                        Resource URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter the resource URL"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Add Resource"}
                </button>
                {success && (
                    <p className="text-green-500 mt-4">Resource uploaded successfully!</p>
                )}
                {error && (
                    <p className="text-red-500 mt-4">Error: {error}</p>
                )}
            </form>
        </div>
    );
}
