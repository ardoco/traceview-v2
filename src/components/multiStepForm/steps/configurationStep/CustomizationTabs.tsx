import React from 'react';
import { FormData, TraceLinkConfiguration } from "@/components/multiStepForm/ProjectFormContext";

interface Props {
    currentMethod: 'manual' | 'file_upload';
    setMethod: (method: 'manual' | 'file_upload') => void;
    resetError: () => void;
    updateFormData: (data: Partial<FormData>) => void;
    formData: FormData;
    originalTraceLinkConfiguration: TraceLinkConfiguration | null;
}

export default function CustomizationTabs({
                                              currentMethod,
                                              setMethod,
                                              resetError,
                                              updateFormData,
                                              formData,
                                              originalTraceLinkConfiguration
                                          }: Props) {
    return (
        <div className="flex justify-center mb-6 border-b border-gray-200 w-full max-w-md">
            <button
                className={`px-6 py-3 font-medium transition-colors duration-200 ${
                    currentMethod === 'file_upload' ? 'text-blau-500 border-b-2 border-blau-500' : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => {
                    setMethod('file_upload');
                    resetError();
                    updateFormData({ traceLinkConfiguration: originalTraceLinkConfiguration });
                }}
            >
                Upload Configuration
            </button>
            <button
                className={`px-6 py-3 font-medium transition-colors duration-200 ${
                    currentMethod === 'manual' ? 'text-blau-500 border-b-2 border-blau-500' : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => {
                    setMethod('manual');
                    resetError();
                    if (!formData.traceLinkConfiguration && originalTraceLinkConfiguration) {
                        updateFormData({ traceLinkConfiguration: originalTraceLinkConfiguration });
                    } else if (!formData.traceLinkConfiguration) {
                        updateFormData({ traceLinkConfiguration: {} });
                    }
                }}
            >
                Manual Input
            </button>
        </div>
    );
}
