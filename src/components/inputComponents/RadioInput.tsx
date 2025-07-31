'use client'

import React, {useEffect} from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {getTraceLinkTypes, TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {useFormContext} from "@/contexts/ProjectFormContext";

interface MultiOptionSelectWithInfoProps {
    selectedValue: TraceLinkType | null; // Current selected value
    handleOptionChange: (value: TraceLinkType | null) => void; // Callback when selection changes
    checkCanBeSelected: (option: TraceLinkType) => boolean; // Function to check if an option is disabled
    uploadedFiles: UploadedFile[]; // The uploaded files
}

export default function MultiOptionSelectWithInfo({
                                              selectedValue,
                                              handleOptionChange,
                                              checkCanBeSelected,
                                              uploadedFiles,
                                          }: MultiOptionSelectWithInfoProps) {
    const traceLinkTypes = getTraceLinkTypes();

    // Automatically preselect the first valid option if no option is selected
    useEffect(() => {
        if (selectedValue === null || !checkCanBeSelected(selectedValue)) {
            const preselectedOption = traceLinkTypes.find((option) => option.checkCondition(uploadedFiles));
            if (preselectedOption) {
                handleOptionChange(preselectedOption);
            } else {
                handleOptionChange(null);
            }
        }
    }, [uploadedFiles]);

    return (
        <div className="space-y-3">
            {traceLinkTypes.map((traceLinkType) => (
                <label
                    key={traceLinkType.name}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                        checkCanBeSelected(traceLinkType)
                            ? "shadow-xs border-gray-200 hover:shadow-md hover:border-blau-500 cursor-pointer checked:border-blau-500"
                            : "border-gray-50 cursor-not-allowed"
                    }`}
                >
                    {/* Radio Input */}
                    <input
                        type="radio"
                        name="multi-option-select"
                        value={traceLinkType.name}
                        checked={selectedValue?.name === traceLinkType.name}
                        onChange={() => handleOptionChange(traceLinkType)}
                        disabled={!checkCanBeSelected(traceLinkType)}
                        className="h-4 w-4 disabled:text-gray-400 text-blau-600 focus:ring-blau-500"
                    />

                        <span
                            className={`block text-sm font-medium ${
                                checkCanBeSelected(traceLinkType) ? "text-gray-800" : "text-gray-400"
                            }`}
                        >
                            {traceLinkType.name + " (" + traceLinkType.alternative_name + ")"}
                        </span>
                        <div className="relative group ml-auto">
                            <InformationCircleIcon aria-label="Info about this option" aria-hidden="true"
                                                   className={`size-6 cursor-pointer ${checkCanBeSelected(traceLinkType) ? 'text-blau-500' : 'text-gray-400'}`}/>
                            <div
                                className="absolute top-1 right-0 mb-2 hidden group-hover:block bg-white text-gray-600 text-sm border border-gray-300 p-3 rounded-md shadow-lg z-10 w-96">
                                {traceLinkType.info}
                            </div>
                        </div>

                </label>
            ))}
        </div>
    );
}
