import React from 'react';
import * as Headless from "@headlessui/react";
import clsx from "clsx"

interface Props {
    currentSource: string | null;
    setToDefault: () => void;
    setToCustom: () => void;
}

export default function ConfigurationSourceSelector({currentSource, setToDefault, setToCustom}: Props) {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Headless.Button
                className={clsx(
                    "px-6 py-3 rounded-lg border rounded-lg shadow-xs hover:shadow-md hover:border-blau-500 cursor-pointer",
                    currentSource === 'default' ? 'border-blau-500' : "border-gray-200"
                )}
                onClick={setToDefault}
            >
                Use Default Configuration
            </Headless.Button>
            <Headless.Button
                className={clsx(
                    "px-6 py-3 rounded-lg border rounded-lg shadow-xs hover:shadow-md hover:border-blau-500 cursor-pointer",
                    currentSource === 'custom' ? 'border-blau-500' : "border-gray-200"
                )}
                onClick={setToCustom}
            >
                Customize Configuration
            </Headless.Button>
        </div>
    );
}
