import { useState, useEffect } from "react";
import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../build/contracts/AcademicResources.json";

export default function ReportedResources() {
    const [reportedResources, setReportedResources] = useState([]);
    const [error, setError] = useState(null);

    const fetchReportedResources = async () => {
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

            const resources = await contract.getReportedResources();
            setReportedResources(resources);
        } catch (error) {
            setError(error.message);
        }
    };

    const deleteResource = async (resourceId) => {
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

            await contract.deleteResource(resourceId);
            alert("Resource deleted successfully!");
            fetchReportedResources();
        } catch (error) {
            console.error("Error deleting resource:", error.message);
        }
    };

    useEffect(() => {
        fetchReportedResources();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-11/12 max-w-7xl">
                {reportedResources.map((resource) => (
                    <div key={resource.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{resource.name}</h2>
                        <p className="text-sm text-gray-400 mb-2">Uploader: {resource.uploader}</p>
                        <p className="text-sm text-gray-400 mb-2">Reports: {resource.reports}</p>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-400 hover:underline">
                            View Resource
                        </a>
                        <button
                            onClick={() => deleteResource(resource.id)}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Delete Resource
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}