"use client";
import { ethers } from "ethers";
import AcademicResourcesABI from "../../../../../build/contracts/AcademicResources.json";
import { useEffect } from "react";

export default function ValidatorPanel({ resourceId }) {
    const deploySampleResource = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                throw new Error("MetaMask is not installed. Please install it.");
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log("Signer address:", await signer.getAddress());

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                AcademicResourcesABI.abi,
                signer
            );

            console.log("Contract address:", contract.target);

            const tx = await contract.uploadResource("Sample Resource", "https://example.com/resource");
            console.log("Transaction sent:", tx);

            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            alert("Sample resource uploaded successfully!");
        } catch (error) {
            console.error("Error uploading resource:", error.message);
        }
    };

    const handleVote = async (voteFor) => {
        try {
            if (typeof window.ethereum === "undefined") {
                throw new Error("MetaMask is not installed. Please install it.");
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            console.log("Signer address:", await signer.getAddress());

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                AcademicResourcesABI.abi,
                signer
            );

            console.log("Contract address:", contract.target);

            console.log(`Calling voteOnResource with ID: ${resourceId} and voteFor: ${voteFor}`);
            const tx = await contract.voteOnResource(resourceId, voteFor);
            console.log("Transaction sent:", tx);

            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            alert("Vote submitted successfully!");
        } catch (error) {
            console.error("Error voting on resource:", error.message);
        }
    };

    useEffect(() => {
        deploySampleResource();
    }, []);

    return (
        <div>
            <button onClick={() => handleVote(true)}>Approve</button>
            <button onClick={() => handleVote(false)}>Disapprove</button>
        </div>
    );
}
