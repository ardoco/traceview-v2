import React, {useEffect} from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {getTraceLinkTypes, TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

interface MultiOptionSelectWithInfoProps {
    selectedValue: TraceLinkType | null; // Current selected value
    handleOptionChange: (value: TraceLinkType) => void; // Callback when selection changes
    checkCanBeSelected: (option: TraceLinkType) => boolean; // Function to check if an option is disabled
    uploadedFiles: UploadedFile[]; // The uploaded files
}

export function MultiOptionSelectWithInfo({
                                              selectedValue,
                                              handleOptionChange,
                                              checkCanBeSelected,
                                              uploadedFiles,
                                          }: MultiOptionSelectWithInfoProps) {
    const traceLinkTypes = getTraceLinkTypes();

    console.log(selectedValue?.name, traceLinkTypes.map(e => e.name));

    // Automatically preselect the first valid option if no option is selected
    useEffect(() => {
        if (selectedValue === null) {
            const preselectedOption = traceLinkTypes.find((option) => option.checkCondition(uploadedFiles));
            if (preselectedOption) {
                handleOptionChange(preselectedOption);
                selectedValue = preselectedOption;
            }
        }
    }, []);

    // const findSelected = () => {
    //     if (!selectedValue) {
    //         const preselectedOption = traceLinkTypes.find((option) => option.checkCondition(uploadedFiles)) || null;
    //         if (preselectedOption) {
    //             handleOptionChange(preselectedOption);
    //             return preselectedOption || null;
    //         } else {
    //             return null;
    //         }
    //     } else {
    //         return selectedValue || null;
    //     }
    // }

    return (
        <div className="space-y-3">
            {traceLinkTypes.map((traceLinkType) => (
                <label
                    key={traceLinkType.name}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                        checkCanBeSelected(traceLinkType)
                            ? "shadow-xs border-gray-200 hover:shadow-md hover:border-blau-600 cursor-pointer checked:border-blau-500"
                            : "border-gray-100 cursor-not-allowed opacity-50"
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
                        className="h-4 w-4 text-blau-500 focus:ring-blau-500"
                    />

                        <span
                            className={`block text-sm font-medium ${
                                checkCanBeSelected(traceLinkType) ? "text-gray-800" : "text-gray-400"
                            }`}
                        >
                            {traceLinkType.name}
                        </span>
                        <div className="relative group">
                            <InformationCircleIcon aria-label="Info about this option" aria-hidden="true"
                                                   className="size-6 text-blau-500 cursor-pointer"/>
                            <div
                                className="absolute left-6 top-1 hidden group-hover:block bg-white text-black border border-gray-300 p-2 rounded-sm shadow-md z-10 w-96">
                                {traceLinkType.info}
                            </div>
                        </div>

                </label>
            ))}
        </div>
    );
}

export default MultiOptionSelectWithInfo;
