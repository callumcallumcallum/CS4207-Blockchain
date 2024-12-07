"use client";
import ValidatorPanel from "./ValidatorPanel";

export default function ValidatorPage({params: {id}}) {
    return (
        <div>
            <h1>Validator Panel</h1>
            <ValidatorPanel resourceId={id} /> {}
        </div>
    );
}