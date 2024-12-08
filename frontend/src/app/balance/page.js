"use client";

import { useState, useEffect } from "react";
import { getContractsWithSigner } from "../../../utils/getContracts";

export default function BalancePanel() {
    const [balance, setBalance] = useState(null);
    const [rewards, setRewards] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { tokenContract, stakingContract } = await getContractsWithSigner();

                const address = await tokenContract.runner.getAddress();
                setWalletAddress(address);

                console.log("User Address:", address);

                const userBalance = await tokenContract.balanceOf(address);
                setBalance(userBalance.toString());

                console.log("User Balance:", userBalance.toString());

                const userRewards = await stakingContract.earned(address);
                setRewards(userRewards.toString());

                console.log("User Rewards:", userRewards.toString());
            } catch (error) {
                console.error("Error fetching details:", error.message);
                setError(error.message);
            }
        };

        fetchDetails();
    }, []);

    const handleCashout = async () => {
        try {
            setLoading(true);
            setError(null);

            const { stakingContract } = await getContractsWithSigner();

            const tx = await stakingContract.payValidatorReward(walletAddress);
            await tx.wait();

            alert("Rewards cashed out successfully!");

            const updatedRewards = await stakingContract.earned(walletAddress);
            setRewards(updatedRewards.toString());
        } catch (error) {
            console.error("Error cashing out rewards:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Your Balance</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {walletAddress && (
                <p className="text-gray-400 mb-4">
                    <strong>Wallet Address:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
            )}
            {balance !== null ? (
                <p className="text-white text-lg mb-4">
                    <strong>Balance:</strong> {balance} Academic Tokens
                </p>
            ) : (
                <p className="text-gray-400 mb-4">Fetching balance...</p>
            )}
            {rewards !== null ? (
                <p className="text-white text-lg mb-4">
                    <strong>Rewards Earned:</strong> {rewards} Academic Tokens
                </p>
            ) : (
                <p className="text-gray-400 mb-4">Fetching rewards...</p>
            )}
            <button
                onClick={handleCashout}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading || rewards === "0"}
            >
                {loading ? "Processing..." : "Cash Out Rewards"}
            </button>
        </div>
    );
}