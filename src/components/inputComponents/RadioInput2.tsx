import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Option {
    value: string;
    label: string;
    info: string; // Additional information about the option
    condition: boolean; // Determines if the option is selectable
}

interface MultiOptionSelectWithInfoProps {
    selectedValue?: string; // Current selected value
    handleOptionChange: (value: string) => void; // Callback when selection changes
}

export const options: Option[] = [
    {
        value: "sad-sam",
        label: "SAD-SAM",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
        condition: true,
    },
    {
        value: "sad-code",
        label: "SAD-Code",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Code",
        condition: false,
    },
    {
        value: "sam-code",
        label: "SAM-Code",
        info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded Code",
        condition: true,
    },
    {
        value: "sad-sam-code",
        label: "SAD-SAM-Code",
        info: "Finds transitive traceLinks between SAD and the Code via SAM",
        condition: false,
    },
];

export function MultiOptionSelectWithInfo({
                                              selectedValue,
                                              handleOptionChange,
                                          }: MultiOptionSelectWithInfoProps) {
    return (
        <div className="space-y-3">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                        option.condition
                            ? "border-blue-500 hover:shadow-md hover:border-blue-600 cursor-pointer"
                            : "border-gray-300 cursor-not-allowed opacity-50"
                    }`}
                >
                    {/* Radio Input */}
                    <input
                        type="radio"
                        name="multi-option-select"
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={() => handleOptionChange(option.value)}
                        disabled={!option.condition}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />

                        <span
                            className={`block text-sm font-medium ${
                                option.condition ? "text-gray-800" : "text-gray-400"
                            }`}
                        >
                            {option.label}
                        </span>
                        <div className="relative group">
                            <InformationCircleIcon aria-label="Info about this option" aria-hidden="true"
                                                   className="size-6 text-blue-500 cursor-pointer"/>
                            <div
                                className="absolute left-6 top-1 hidden group-hover:block bg-white text-black border border-gray-300 p-2 rounded shadow-md z-10 w-96">
                                {option.info}
                            </div>
                        </div>

                </label>
            ))}
        </div>
    );
}

export default MultiOptionSelectWithInfo;
