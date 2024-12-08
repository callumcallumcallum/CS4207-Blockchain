"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import ValidatorPanel from "./ValidatorPanel";

export default function ValidatorPage({ params }) {
    const unwrappedParams = use(params);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
            <h1 className="text-4xl font-bold mb-8">Validator Panel</h1>
            <ValidatorPanel resourceId={unwrappedParams.id} />
        </div>
    );
}
