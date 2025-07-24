import React from 'react';
import TextInput from "@/components/inputComponents/TextInput";
import {TraceLinkConfiguration} from "@/contexts/ProjectFormContext";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";
import {Button} from "@headlessui/react";

interface Props {
    config: TraceLinkConfiguration | null;
    updateFormData: (data: Partial<{ traceLinkConfiguration: TraceLinkConfiguration }>) => void;
    onReset: () => void;
}

const formatKey = (key: string): string => {
    return key
        .replace(/::/g, ': ')
        .trim()
        .split(' ')
        .map(word => (word.toLowerCase() === 'url' ? 'URL' : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
};

export default function ManualInputSection({config, updateFormData, onReset}: Props) {
    const handleChange = (key: string, newValue: string) => {
        if (config) {
            updateFormData({
                traceLinkConfiguration: {
                    ...config,
                    [key]: newValue
                }
            });
        }
    };

    const handleDownloadClick = () => {
        const data = JSON.stringify(config, null, 2);
        console.log('Data to be written:', data);

        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ardoco_configuration.json';
        document.body.appendChild(a);
        a.click();
    }

    return (
        <div className="w-full max-w-4xl p-6 rounded-lg border border-gray-100">
            <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">Edit Configuration Parameters</h4>
            <div className="flex justify-end mb-4">
                <Button onClick={handleDownloadClick} className=" p-2 text-gray-700 hover:text-gray-200">
                    <ArrowDownTrayIcon className="w-5 h-5"/>
                </Button>

                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                    Reset to Default
                </button>
            </div>
            <div className="flex flex-col space-y-3">
                {config && Object.keys(config).length > 0 ? (
                    Object.entries(config).map(([key, value]) => (
                        <div key={key}
                             className="flex flex-col sm:flex-row items-start sm:items-center py-2 border-b border-gray-100 last:border-b-0">
                            <label htmlFor={`config-${key}`}
                                   className="font-medium text-gray-700 w-full sm:w-1/2 shrink-0 pr-4">
                                {formatKey(key)}:
                            </label>
                            <div className="w-full sm:w-1/2">
                                <TextInput
                                    value={String(value ?? '')}
                                    onChange={e => handleChange(key, e.target.value)}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 italic">No custom settings loaded.</p>
                )}
            </div>
        </div>
    );
}
