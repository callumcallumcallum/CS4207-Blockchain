"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import AcademicResourcesABI from "../../../../build/contracts/AcademicResources.json";

export default function ResourcesPage() {
    const [pendingResources, setPendingResources] = useState([]);
    const [validatedResources, setValidatedResources] = useState([]);
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

            const pending = await contract.getPendingResources();
            const validated = await contract.getValidatedResources();

            setPendingResources(pending);
            setValidatedResources(validated);
        } catch (error) {
            console.error("Error fetching resources:", error.message);
            setError(error.message);
        }
    };

    const reportResource = async (resourceId) => {
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

            await contract.reportResource(resourceId);
            alert("Resource reported successfully!");

            fetchResources();
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const renderResourceCard = (resource) => (
        <div key={resource.id.toString()} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{resource.name}</h2>
            <p className="text-sm text-gray-400 mb-2">Uploader: {resource.uploader}</p>
            <p className="text-sm text-gray-400 mb-2">Upvotes: {resource.upvotes.toString()}</p>
            <p className="text-sm text-gray-400 mb-2">Reports: {resource.reports.toString()}</p>
            <p
                className={`font-medium ${resource.validated ? "text-green-500" : "text-yellow-500"
                    }`}
            >
                Validated: {resource.validated ? "Yes" : "No"}
            </p>
            <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-blue-400 hover:underline"
            >
                View Resource
            </a>
            {resource.validated && (
                <button
                    onClick={() => reportResource(resource.id)}
                    className="block mt-4 text-red-500 hover:underline"
                >
                    Report Resource
                </button>
            )}
            <Link
                href={`/consensus/${resource.id}`}
                className="block mt-4 text-blue-500 hover:underline"
            >
                Go to Consensus Vote
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Academic Resources</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="w-11/12 max-w-7xl mb-10">
                <h2 className="text-2xl font-bold mb-4">Pending Resources</h2>
                {pendingResources.length === 0 ? (
                    <p className="text-gray-400">No pending resources found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingResources.map(renderResourceCard)}
                    </div>
                )}
            </div>

            <div className="w-11/12 max-w-7xl">
                <h2 className="text-2xl font-bold mb-4">Validated Resources</h2>
                {validatedResources.length === 0 ? (
                    <p className="text-gray-400">No validated resources found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {validatedResources.map(renderResourceCard)}
                    </div>
                )}
            </div>
        </div>
    );
}
