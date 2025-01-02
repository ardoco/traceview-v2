import React, {useState} from "react";
import {Bars3Icon, InformationCircleIcon} from "@heroicons/react/24/outline";

interface Option {
    value: string;
    label: string;
    info: string; // Additional information about the option
    condition: boolean; // Determines if the option is selectable
}

const MultiOptionSelectWithInfo: React.FC = () => {
    const options: Option[] = [
        {
            value: "sad-sam",
            label: "SAD-SAM",
            info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
            condition: true, //TODO: condition on uploaded files
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
            info: "Finds transitive traceLinks the Software Architecture Documentation (SAD) and the uploaded Code by finding transitive relationships between at the traceLinks from Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM) as well as the traceLinks from the Software Architecture Model (SAM) and the uploaded Code",
            condition: false,
        },
    ];

    // Get the first selectable option
    const getFirstSelectableOption = () => {
        const firstSelectableOption = options.find((option) => option.condition);
        return firstSelectableOption ? firstSelectableOption.value : null;
    };

    // State for the currently selected option
    const [selectedOption, setSelectedOption] = useState<string | null>(
        getFirstSelectableOption()
    );

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        console.log(value);
    };

    return (
        <div className="flex flex-col gap-4">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={`flex items-center gap-2 p-2 rounded ${
                        option.condition
                            ? "bg-gray-100 cursor-pointer"
                            : "bg-gray-200 cursor-not-allowed"
                    }`}
                >
                    <input
                        type="radio"
                        name="multi-option-select"
                        value={option.value}
                        checked={selectedOption === option.value}
                        onChange={() => handleOptionChange(option.value)}
                        disabled={!option.condition}
                        className="cursor-pointer"
                    />
                    <span
                        className={`${
                            option.condition ? "text-black" : "text-gray-500"
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
};

export default MultiOptionSelectWithInfo;
