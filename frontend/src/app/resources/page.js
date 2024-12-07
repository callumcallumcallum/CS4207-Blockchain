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
                throw new Error("MetaMask is not installed. Please install it.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                AcademicResourcesABI.abi,
                signer
            );

            console.log("Fetching resources...");
            const nextResourceId = await contract.getNextResourceId();
            console.log("Total resources:", nextResourceId);

            const resources = [];
            console.log(resources)
            for (let i = 1; i < nextResourceId; i++) {
                try {
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
                } catch (error) {
                    console.error(`Error fetching resource ${i}:`, error.message);
                }
            }

            setResources(resources);
        } catch (error) {
            console.error("Error fetching resources:", error.message);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <div>
            <h1>Academic Resources</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
                {resources.map((resource) => (
                    <li key={resource.id}>
                        <h2>{resource.name}</h2>
                        <p>
                            URL:{" "}
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                {resource.url}
                            </a>
                        </p>
                        <p>Uploader: {resource.uploader}</p>
                        <p>Votes For: {resource.votesFor}</p>
                        <p>Votes Against: {resource.votesAgainst}</p>
                        <p>Status: {resource.approved ? "Approved" : "Pending"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
