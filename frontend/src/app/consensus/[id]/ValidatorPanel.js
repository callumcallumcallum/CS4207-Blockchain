"use client";

import { useState, useEffect } from "react";
import { getContractsWithSigner } from "../../../../utils/getContracts";

export default function ValidatorPanel({ resourceId }) {
    const [isValidator, setIsValidator] = useState(false);
    const [error, setError] = useState(null);
    const [resource, setResource] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const { validatorContract, resourcesContract } = await getContractsWithSigner();

                const address = await resourcesContract.runner.getAddress();
                console.log("User Address:", address);

                const stakes = await validatorContract.stakes(address);
                console.log("Staked Tokens:", stakes.toString());

                const userIsValidator = await validatorContract.isValidator(address);
                console.log("Is Validator:", userIsValidator);
                setIsValidator(userIsValidator);

                const pending = await resourcesContract.getPendingResources();
                const matchedResource = pending.find(r => r.id.toString() === resourceId.toString());

                if (matchedResource) {
                    setResource(matchedResource);
                    console.log("Matched Resource:", matchedResource);
                } else {
                    setError(`No pending resource found with ID ${resourceId}`);
                }

            } catch (error) {
                console.error("Error initializing:", error.message);
                setError(error.message);
            }
        };

        initialize();
    }, [resourceId]);

    const handleValidate = async () => {
        try {
            if (!isValidator) {
                throw new Error("You are not authorized to validate resources.");
            }

            const { resourcesContract } = await getContractsWithSigner();
            console.log(`Validating Resource ID: ${resourceId}`);

            const tx = await resourcesContract.validateResource(resourceId);
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
            {resource && (
                <div className="text-white mb-4">
                    <p><strong>Name:</strong> {resource.name}</p>
                    <p><strong>URL:</strong> {resource.url}</p>
                    <p><strong>Uploader:</strong> {resource.uploader}</p>
                </div>
            )}
            {isValidator && resource && (
                <button
                    onClick={handleValidate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Validate Resource
                </button>
            )}
        </div>
    );
}
