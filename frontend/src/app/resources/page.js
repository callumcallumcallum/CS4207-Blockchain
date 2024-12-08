"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../build/contracts/AcademicResources.json";

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [error, setError] = useState(null);

    const fetchResources = async () => {
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

            const nextResourceId = await contract.getNextResourceId();
            const resources = [];
            for (let i = 1; i < nextResourceId; i++) {
                const resource = await contract.getResource(i);
                resources.push({
                    id: i,
                    name: resource[0],
                    url: resource[1],
                    uploader: resource[2],
                    votesFor: resource[3],
                    votesAgainst: resource[4],
                    approved: resource[5],
                });
            }
            setResources(resources);
        } catch (error) {
            setError(error.message);
        }
    };

    const reportResource = async (resourceId) => {
        try{
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

            await contract.reportResource(resourceId);
            alert("Resource reported successfully!");
        } catch (error) {
            console.error(error.message);
        }
    };


    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Academic Resources</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-11/12 max-w-7xl">
                {resources.map((resource) => (
                    <div key={resource.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{resource.name}</h2>
                        <p className="text-sm text-gray-400 mb-2">Uploader: {resource.uploader}</p>
                        <p className="text-sm text-gray-400 mb-2">Votes For: {resource.votesFor}</p>
                        <p className="text-sm text-gray-400 mb-2">Votes Against: {resource.votesAgainst}</p>
                        <p
                            className={`font-medium ${resource.approved ? "text-green-500" : "text-yellow-500"
                                }`}
                        >
                            Status: {resource.approved ? "Approved" : "Pending"}
                        </p>
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-4 text-blue-400 hover:underline"
                        >
                            View Resource
                        </a>
                        <button
                            onClick={() => reportResource(resource.id)}
                            className="block mt-4 text-red-500 hover:underline">Report Resource</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
