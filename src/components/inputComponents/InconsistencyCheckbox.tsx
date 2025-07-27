'use client'

import React, {useEffect} from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {useFormContext} from "@/contexts/ProjectFormContext";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";

interface InconsistencyCheckboxProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

/**
 * A styled checkbox component with a label and an informational tooltip,
 * designed for finding inconsistencies.
 */
export default function InconsistencyCheckbox({ checked, onChange, disabled }: InconsistencyCheckboxProps) {
    return (
        <label className={`flex items-center gap-3 p-3 border rounded-lg w-full ${
            !disabled
                ? "shadow-xs border-gray-200 cursor-pointer hover:shadow-sm"
                : "border-gray-50 cursor-not-allowed "
        }`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="h-4 w-4 text-blau-500 focus:ring-blau-500 rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className={`block text-sm font-medium ${!disabled ? 'text-gray-800' : 'text-gray-400'}`}>
                Find Inconsistencies
            </span>
            <div className="relative group ml-auto">
                <InformationCircleIcon
                    aria-label="Info about finding inconsistencies"
                    className={`size-6 ${!disabled ? 'text-blau-500 cursor-pointer' : 'text-gray-400'}`}
                />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-white text-black border border-gray-300 p-3 rounded-md shadow-lg z-10 w-96">
                    <p className="font-bold mb-1 text-gray-800">About Inconsistencies</p>
                    <p className="text-sm text-gray-600">When selected, ArDoCo additionally finds inconsistencies between the documentation and the architecture model.</p>
                    <p className="mt-2 text-sm text-gray-600">An inconsistency can be:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                        <li>A sentence in the documentation not represented in the architecture model.</li>
                        <li>An element in the architecture model not described in the documentation.</li>
                    </ul>
                    <p className="mt-2 font-semibold text-blau-600 text-sm">This option is only available when the 'SAD_SAM' Trace Link Type is selected.</p>
                </div>
            </div>
        </label>
    );
}
