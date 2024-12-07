"use client";

import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../../build/contracts/AcademicResources.json";

export default function ValidatorPanel({ resourceId }) {
    const handleVote = async (voteFor) => {
        try {
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

            await contract.voteOnResource(resourceId, voteFor);
            alert("Vote submitted successfully!");
        } catch (error) {
            console.error("Error voting on resource:", error.message);
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Vote on Resource</h1>
            <div className="flex space-x-4">
                <button
                    onClick={() => handleVote(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                    Approve
                </button>
                <button
                    onClick={() => handleVote(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Disapprove
                </button>
            </div>
        </div>
    );
}
