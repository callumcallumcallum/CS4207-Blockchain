"use client"
import { useState, useEffect } from 'react';
import { getContractsWithSigner } from "../../../utils/getContracts";
import { parseEther, formatEther } from 'ethers';

export default function StakePage() {
    const [stakeAmount, setStakeAmount] = useState("");
    const [unstakeAmount, setUnstakeAmount] = useState("");
    const [message, setMessage] = useState("");
    const [stakedBalance, setStakedBalance] = useState("0");

    useEffect(() => {
        const fetchStakedBalance = async () => {
            try {
                const { stakingContract } = await getContractsWithSigner();
                const signerAddress = await (await stakingContract.provider.getSigner()).getAddress();
                const balance = await stakingContract.balance(signerAddress);
                setStakedBalance(formatEther(balance));
            } catch (err) {
                console.error("Error fetching staked balance:", err);
            }
        };

        fetchStakedBalance();
    }, []);

    const handleStake = async () => {
            setMessage("Staking in progress...");
            const { tokenContract, stakingContract } = await getContractsWithSigner();
            const amountInWei = parseEther(`${parseInt(stakeAmount * (10^18))}`);
            console.log(amountInWei)
            const stakingAddress = await stakingContract.getAddress();

            const approveTx = await tokenContract.approve(stakingAddress, stakeAmount);
            await approveTx.wait();

            console.log(amountInWei)
            const stakeTx = await stakingContract.stake(stakeAmount);
            await stakeTx.wait();
            console.log("SIDNFIOSDFOBSDIOFSDOODSBF")
            console.log(stakeTx)


            setMessage(`Staked ${stakeAmount} tokens successfully!`);
            setStakeAmount("");
    };

    const handleUnstake = async () => {
        try {
            setMessage("Unstaking in progress...");
            const { stakingContract } = await getContractsWithSigner();
            const amountInWei = parseEther(unstakeAmount);

            const unstakeTx = await stakingContract.unstake(amountInWei);
            await unstakeTx.wait();

            const signerAddress = await (await stakingContract.provider.getSigner()).getAddress();
            const balance = await stakingContract.balance(signerAddress);
            setStakedBalance(formatEther(balance));

            setMessage(`Unstaked ${unstakeAmount} tokens successfully!`);
            setUnstakeAmount("");
        } catch (err) {
            console.error(err);
            setMessage("Error occurred while unstaking. Check console for details.");
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold text-white mb-4">Stake / Unstake Tokens</h1>
            
            <p className="text-white mb-4">Currently Staked: {stakedBalance} tokens</p>
            
            <div className="w-full mb-4">
                <input
                    type="number"
                    placeholder="Amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full p-2 rounded mb-2 color-black"
                />
                <button 
                    onClick={handleStake} 
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Stake
                </button>
            </div>

            <div className="w-full mb-4">
                <input
                    type="number"
                    placeholder="Amount to unstake"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="w-full p-2 rounded mb-2 color-black"
                />
                <button 
                    onClick={handleUnstake} 
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                    Unstake
                </button>
            </div>

            {message && <p className="text-green-500 mt-4">{message}</p>}
        </div>
    );
}
