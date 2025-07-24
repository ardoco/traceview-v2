import React from 'react';

interface Props {
    currentMethod: 'manual' | 'file_upload';
    setMethod: (method: 'manual' | 'file_upload') => void;
}

export default function CustomizationTabs({currentMethod,
                                              setMethod
                                          }: Props) {
    return (
        <div className="flex justify-center mb-6 border-b border-gray-200 w-full max-w-md">
            <button
                className={`px-6 py-3 font-medium transition-colors duration-200 ${
                    currentMethod === 'file_upload' ? 'text-blau-500 border-b-2 border-blau-500' : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => {
                    setMethod('file_upload');
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
                }}
            >
                Manual Input
            </button>
        </div>
    );
}
