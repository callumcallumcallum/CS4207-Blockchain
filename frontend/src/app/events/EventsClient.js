"use client";

import { useState } from "react";
import { ethers } from "ethers";
import AcadmeicTokenABI from "../../../../build/contracts/AcademicToken.json";

export default function EventsClient({ events }) {
    const [eventList, setEventList] = useState(events);
    const [modalOpen, setModalOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        capacity: "",
    });
    let [contract, setContract] = useState(false);
    const connectWallet = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                throw new Error("MetaMask is not installed.");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            const signer = await provider.getSigner();

            setContract(new ethers.Contract(
                process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
                AcadmeicTokenABI.abi,
                signer
            ));

            setWalletAddress(accounts[0]);
            console.log("Connected wallet:", accounts[0]);
        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEvent = async () => {
        try {
            const res = await fetch("/api/event", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to create event");
            }

            const newEvent = await res.json();
            setEventList((prev) => [...prev, newEvent]);
            setModalOpen(false);
            setFormData({ title: "", description: "", price: "", capacity: "" });
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    const handleJoinEvent = async (eventId, eventPrice) => {
        try {
            if (!walletAddress) {
                throw new Error("Please connect your wallet first.");
            }

            contract.burn(eventPrice);

            const res = await fetch(`/api/event/${eventId}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    blockchainAddress: walletAddress,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to join event");
            }

            const updatedEvent = await res.json();
            setEventList((prev) =>
                prev.map((event) =>
                    event.id === updatedEvent.id ? updatedEvent : event
                )
            );
        } catch (error) {
            console.error("Error joining event:", error);
        }
    };

    return (
        <div className="w-11/12 max-w-7xl">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    {walletAddress ? `Wallet Connected: ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
                </button>
                <button
                    onClick={() => setModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Create New Event
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
                            Price: {event.price} AKTN | Capacity: {event.capacity} | Attendees: {event.attendee.length}
                        </p>
                        <button
                            onClick={() => handleJoinEvent(event.id, event.price)}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Join Event
                        </button>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-2xl font-bold mb-4">Create Event</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="title"
                                placeholder="Event Title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded focus:ring focus:ring-blue-500"
                            />
                            <textarea
                                name="description"
                                placeholder="Event Description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded focus:ring focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                name="price"
                                placeholder="Event Price (AKTN)"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded focus:ring focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                name="capacity"
                                placeholder="Event Capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded focus:ring focus:ring-blue-500"
                            />
                            <button
                                onClick={handleCreateEvent}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
