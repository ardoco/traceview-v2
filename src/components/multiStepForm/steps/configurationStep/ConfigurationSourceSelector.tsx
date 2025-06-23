import React from 'react';

interface Props {
    currentSource: string | null;
    setToDefault: () => void;
    setToCustom: () => void;
}

export default function ConfigurationSourceSelector({ currentSource, setToDefault, setToCustom }: Props) {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <button
                className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                    currentSource === 'default' ? 'bg-blau-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={setToDefault}
            >
                Use Default Configuration
            </button>
            <button
                className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                    currentSource === 'custom' ? 'bg-blau-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={setToCustom}
            >
                Customize Configuration
            </button>
        </div>
    );
}
