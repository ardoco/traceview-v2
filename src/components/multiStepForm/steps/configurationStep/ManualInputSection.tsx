import React from 'react';
import TextInput from "@/components/inputComponents/TextInput";
import {TraceLinkConfiguration} from "@/contexts/ProjectFormContext";
import {Button} from "@headlessui/react";
import DownLoadFileComponent from "@/util/DownloadFileComponent";

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

    return (
        <div className="w-full max-w-4xl p-6 rounded-lg border border-gray-100">
            <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">Edit Configuration Parameters</h4>
            <div className="flex justify-end mb-4">

                {/*Download File Button*/}
                <div className="flex items-center px-3 mr-1 hover:bg-red-500">
                    <DownLoadFileComponent
                        fileName="ardoco_configuration.json"
                        prepareDataToExport={() => { return JSON.stringify(config, null, 2)}}
                        title="Download Configuration"
                    />
                </div>

                {/*Reset Configuration Button*/}
                <Button
                    onClick={onReset}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors duration-200"
                >
                    Reset to Default
                </Button>
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
