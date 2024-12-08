"use client";

import { useState } from "react";
import { getContractsWithSigner } from "../../../utils/getContracts";

export default function EventsClient({ events }) {
    const [eventList, setEventList] = useState(events);
    const [modalOpen, setModalOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);

    const connectWallet = async () => {
        try {
            const { tokenContract } = await getContractsWithSigner();
            const address = await tokenContract.runner.getAddress();
            setWalletAddress(address);
            console.log("Connected wallet:", address);
        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    };

    const handleBurnTokens = async (eventPrice) => {
        try {
            if (!walletAddress) {
                throw new Error("Please connect your wallet first.");
            }

            const { tokenContract } = await getContractsWithSigner();

            console.log("Burning Event Price:", eventPrice);

            const tx = await tokenContract.burn(eventPrice);
            await tx.wait();

            alert(`Successfully burned ${eventPrice} tokens for the event!`);
        } catch (error) {
            console.error("Error burning tokens:", error.message);
            alert(error.message || "Failed to burn tokens.");
        }
    };

    return (
        <div className="w-11/12 max-w-7xl">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    {walletAddress
                        ? `Wallet Connected: ${walletAddress.slice(0, 6)}...`
                        : "Connect Wallet"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventList.map((event) => (
                    <div
                        key={event.id}
                        className="bg-gray-800 p-4 rounded-lg shadow-md"
                    >
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <p className="text-gray-400">{event.description}</p>
                        <p className="text-sm text-gray-500">
                            Capacity: {event.capacity} | Attendees: {event.attendee.length}
                        </p>
                        <p className="text-sm text-gray-500">
                            Price: {event.price} Tokens
                        </p>
                        <button
                            onClick={() => handleBurnTokens(event.price)}
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Join Event
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
