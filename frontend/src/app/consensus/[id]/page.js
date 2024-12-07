"use client";

import ValidatorPanel from "./ValidatorPanel";

export default function ValidatorPage({ params: { id } }) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Validator Panel</h1>
            <ValidatorPanel resourceId={id} />
        </div>
    );
}
