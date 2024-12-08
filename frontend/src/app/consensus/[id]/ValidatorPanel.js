"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../../build/contracts/AcademicResources.json";
import ValidatorABI from "../../../../../build/contracts/Validator.json";

export default function ValidatorPanel({ resourceId }) {
    const [isValidator, setIsValidator] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkValidatorRole = async () => {
            try {
                if (typeof window.ethereum === "undefined") {
                    throw new Error("MetaMask is not installed.");
                }

                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                const validatorContract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_VALIDATOR_ADDRESS,
                    ValidatorABI.abi,
                    signer
                );

                const address = await signer.getAddress();
                const isValidator = await validatorContract.isValidator(address);
                setIsValidator(isValidator);
            } catch (error) {
                console.error("Error checking validator role:", error.message);
                setError(error.message);
            }
        };

        checkValidatorRole();
    }, []);

    const handleValidate = async () => {
        try {
            if (!isValidator) {
                throw new Error("You are not authorized to validate resources.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                AcademicResourcesABI.abi,
                signer
            );

            const tx = await contract.validateResource(resourceId);
            await tx.wait();
            alert("Resource validated successfully!");
        } catch (error) {
            console.error("Error validating resource:", error.message);
            setError(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Validator Panel</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
                onClick={handleValidate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                Validate Resource
            </button>
        </div>
    );
}
