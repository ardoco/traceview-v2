import React from 'react';
import * as Headless from "@headlessui/react";
import clsx from "clsx"
import {ConfigurationMethod} from "@/components/multiStepForm/steps/configurationStep/ConfigurationMethod";

interface Props {
    currentMethod: ConfigurationMethod
    setMethod: (method: ConfigurationMethod) => void;
    setToDefault: () => void;
}

export default function ConfigurationSourceSelector({currentMethod, setMethod, setToDefault}: Props) {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <ConfigurationButton
                onClick={() => {
                    setMethod(ConfigurationMethod.DEFAULT)
                    setToDefault()
                }}
                isActive={currentMethod === ConfigurationMethod.DEFAULT}
                title="Use Default Configuration"
            />
            <ConfigurationButton
                onClick={() => setMethod(ConfigurationMethod.FILE_UPLOAD)}
                isActive={
                    currentMethod === ConfigurationMethod.MANUAL_INPUT ||
                    currentMethod === ConfigurationMethod.FILE_UPLOAD
                }
                title="Customize Configuration"
            />
        </div>
    );
}

interface ConfigurationButtonProps {
    onClick: () => void;
    isActive: boolean;
    title: string;
}

function ConfigurationButton({onClick, isActive, title}: ConfigurationButtonProps) {
    return (
        <Headless.Button
            className={clsx(
                "px-6 py-3 rounded-lg border shadow-xs hover:shadow-md hover:border-blau-500  cursor-pointer",
                isActive ? 'border-blau-500 border-2' : "border-gray-200"
            )}
            onClick={onClick}
        >
            {title}
        </Headless.Button>
    );
}
