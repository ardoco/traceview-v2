'use client'

import React, {useEffect} from "react";
import {getTraceLinkTypes, TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import clsx from "clsx";
import {DisplayInformationQuestionMark} from "@/components/DisplayInformationQuestionMark";

interface MultiOptionSelectWithInfoProps {
    selectedValue: TraceLinkType | null;
    handleOptionChange: (value: TraceLinkType | null) => void;
    checkCanBeSelected: (option: TraceLinkType) => boolean;
    uploadedFiles: UploadedFile[];
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
                    className={clsx("flex items-center gap-3 p-3 border rounded-lg",
                        checkCanBeSelected(traceLinkType) ?
                            "shadow-xs border-gray-200 cursor-pointer hover:shadow-sm"
                            : "border-gray-50 cursor-not-allowed")
                    }
                >
                    {/* Radio Input */}
                    <input
                        type="radio"
                        name="multi-option-select"
                        value={traceLinkType.name}
                        checked={selectedValue?.name === traceLinkType.name}
                        onChange={() => handleOptionChange(traceLinkType)}
                        disabled={!checkCanBeSelected(traceLinkType)}
                        className="h-4 w-4 text-blau-500 focus:ring-blau-500 rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <span
                        className={`block text-sm font-medium ${
                            checkCanBeSelected(traceLinkType) ? "text-gray-800" : "text-gray-400"
                        }`}
                    >
                        {traceLinkType.name + " (" + traceLinkType.alternative_name + ")"}
                    </span>

                    <DisplayInformationQuestionMark
                        title={traceLinkType.name + " (" + traceLinkType.alternative_name + ") TraceLinks"}
                        descriptionToRender={<span>{traceLinkType.info}</span>}
                        disabled={!checkCanBeSelected(traceLinkType)}
                    />

                </label>
            ))}
        </div>
    );
}

