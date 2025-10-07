'use client'

import React from "react";

import {DisplayInformationQuestionMark} from "@/components/DisplayInformationQuestionMark";

interface InconsistencyCheckboxProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

/**
 * A styled checkbox component with a label and an informational tooltip,
 * designed for finding inconsistencies.
 */
export default function InconsistencyCheckbox({checked, onChange, disabled}: InconsistencyCheckboxProps) {
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

            <DisplayInformationQuestionMark
                title={"Inconsistencies"}
                descriptionToRender={
                    <div>
                        <p>When selected, ardoco additionally finds inconsistencies between the documentation and the
                            architecture model.</p>
                        <p className="mt-2">An inconsistency can be:</p>
                        <ul className="list-disc list-inside pl-2">
                            <li>A sentence in the documentation not represented in the architecture model.</li>
                            <li>An element in the architecture model not described in the documentation.</li>
                        </ul>
                        <p className="mt-2 font-semibold text-blau-600">This option is only available when
                            the &apos;SWATTR&apos;
                            traceLink type is selected.</p>
                    </div>
                }
                disabled={disabled}
            />
        </label>
    );
}
