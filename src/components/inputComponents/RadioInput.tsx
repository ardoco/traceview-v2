'use client';

import React, { useState, useMemo } from "react";

interface Option {
    value: string;
    label: string;
    condition: boolean; // Determines if the option is selectable
}

const MultiOptionSelect: React.FC = () => {
    const options = useMemo(
        () => [
            { value: "sad-sam", label: "Sad-Sam", condition: true },
            { value: "sad-code", label: "Sad-Code", condition: false },
            { value: "sam-code", label: "Sam-Code", condition: true },
            { value: "sad-sam-code", label: "Sad-Sam-Code", condition: false },
        ],
        []
    );

    const getFirstSelectableOption = () => {
        const firstSelectableOption = options.find((option) => option.condition);
        return firstSelectableOption ? firstSelectableOption.value : null;
    };

    const [selectedOption, setSelectedOption] = useState<string | null>(
        getFirstSelectableOption()
    );

    const handleOptionClick = (option: Option) => {
        if (option.condition) {
            setSelectedOption(option.value);
            console.log("Selected option updated to:", option.value);
        }
    };

    console.log("Component rendered, selectedOption:", selectedOption);

    return (
        <div className="flex flex-col gap-2">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    disabled={!option.condition}
                    className={`px-4 py-2 border rounded ${
                        option.condition
                            ? selectedOption === option.value
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-black"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default MultiOptionSelect;
