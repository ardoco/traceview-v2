import React, {useEffect} from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import {FileType} from "@/components/drag-and-drop/FileListItem";

interface Option {
    value: string;
    label: string;
    info: string; // Additional information about the option
    condition: boolean; // Determines if the option is selectable
}

interface MultiOptionSelectWithInfoProps {
    selectedValue: string | null; // Current selected value
    handleOptionChange: (value: string) => void; // Callback when selection changes
}

export function MultiOptionSelectWithInfo({
                                              selectedValue,
                                              handleOptionChange,
                                          }: MultiOptionSelectWithInfoProps) {
    const { formData, updateFormData } = useFormContext();

    const options: Option[] = [
        {
            value: "sad-sam-code",
            label: "SAD-SAM-Code",
            info: "Finds transitive traceLinks between SAD and the Code via SAM",
            condition: formData.files.some(file => file.fileType === FileType.Architecture_Documentation) &&
                formData.files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML) &&
                formData.files.some(file => file.fileType === FileType.Code_Model),
        },
        {
            value: "sad-sam",
            label: "SAD-SAM",
            info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
            condition: formData.files.some(file => file.fileType === FileType.Architecture_Documentation) &&
                formData.files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML),
        },
        {
            value: "sad-code",
            label: "SAD-Code",
            info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Code",
            condition: formData.files.some(file => file.fileType === FileType.Architecture_Documentation) &&
                formData.files.some(file => file.fileType === FileType.Code_Model),
        },
        {
            value: "sam-code",
            label: "SAM-Code",
            info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded Code",
            condition: formData.files.some(file => file.fileType === FileType.Code_Model) &&
                formData.files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML),
        },
    ];

    // Automatically preselect the first valid option if no option is selected
    useEffect(() => {
        if (selectedValue === null) {
            const preselectedOption = options.find((option) => option.condition);
            if (preselectedOption) {
                handleOptionChange(preselectedOption.value);
            }
        }
    }, [selectedValue, options, handleOptionChange]);

    return (
        <div className="space-y-3">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                        option.condition
                            ? "shadow-xs border-gray-200 hover:shadow-md hover:border-blau-600 cursor-pointer checked:border-blau-500"
                            : "border-gray-100 cursor-not-allowed opacity-50"
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
                        className="h-4 w-4 text-blau-500 focus:ring-blau-500"
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
                                                   className="size-6 text-blau-500 cursor-pointer"/>
                            <div
                                className="absolute left-6 top-1 hidden group-hover:block bg-white text-black border border-gray-300 p-2 rounded-sm shadow-md z-10 w-96">
                                {option.info}
                            </div>
                        </div>

                </label>
            ))}
        </div>
    );
}

export default MultiOptionSelectWithInfo;
