import React from 'react';
import {ConfigurationMethod} from "@/components/multiStepForm/steps/configurationStep/ConfigurationMethod";
import clsx from "clsx";

interface Props {
    currentMethod: ConfigurationMethod;
    setMethod: (method: ConfigurationMethod) => void;
}

export default function CustomizationTabs({
                                              currentMethod,
                                              setMethod
                                          }: Props) {
    return (
        <div className="flex justify-center mb-6 border-b border-gray-200 w-full max-w-md">
            <CustomizationTabButton
                currentMethod={currentMethod}
                targetMethod={ConfigurationMethod.FILE_UPLOAD}
                setMethod={setMethod}
                description="Upload File"
            />
            <CustomizationTabButton
                currentMethod={currentMethod}
                targetMethod={ConfigurationMethod.MANUAL_INPUT}
                setMethod={setMethod}
                description="Manual Input"
            />
        </div>
    );
}

interface CustomizationTabButtonProps {
    currentMethod: ConfigurationMethod;
    targetMethod: ConfigurationMethod;
    setMethod: (method: ConfigurationMethod) => void;
    description: string;
}

function CustomizationTabButton({currentMethod, targetMethod, setMethod, description}: CustomizationTabButtonProps) {
    return (
        <button
            className={clsx(
                "px-6 py-3 font-medium transition-colors duration-200",
                currentMethod === targetMethod ? 'text-blau-500 border-b-2 border-blau-500'
                    : 'text-gray-600 hover:text-gray-800'
            )}
            onClick={() => setMethod(targetMethod)}
        >
            {description}
        </button>
    );
}
