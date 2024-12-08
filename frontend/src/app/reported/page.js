"use client";
import ReportedResources from "./reportedResources";
export default function ReportedPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Reported Resources</h1>
            <ReportedResources />
        </div>
    );
}