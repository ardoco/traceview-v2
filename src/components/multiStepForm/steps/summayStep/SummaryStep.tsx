// components/multiStepForm/steps/summayStep/SummaryStep.tsx
import React, { useState } from 'react'; // Import useState
import {useFormContext, TraceLinkConfiguration} from "@/contexts/ProjectFormContext";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

export default function SummaryStep() {
    const {formData, originalTraceLinkConfiguration} = useFormContext();
    const [isConfigExpanded, setIsConfigExpanded] = useState(false); // State for expand/collapse

    const formatKey = (key: string): string => {
        let formatted = key.replace(/::/g, ':: '); // Replace double colons
        formatted = formatted.trim();
        // Capitalize first letter of each word, handle special cases
        formatted = formatted.split(' ').map(word => {
            if (word.toLowerCase() === 'url') return 'URL'; // Keep URL as uppercase if it appears
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        return formatted;
    };

    const displayConfig = (config: TraceLinkConfiguration | null) => {
        if (!config || Object.keys(config).length === 0) {
            return <p className="text-sm text-gray-500 italic">No configuration details available.</p>;
        }

        const configEntries = Object.entries(config);
        const visibleEntries = isConfigExpanded ? configEntries : configEntries.slice(0, 3); // Show first 3 when collapsed

        return (
            <div className="flex flex-col space-y-1"> {/* Compact vertical spacing */}
                {visibleEntries.map(([key, value]) => (
                    <div key={key} className="flex text-sm">
                        {/* Left column: key, wider */}
                        <span className="font-medium text-gray-700 w-2/5 flex-shrink-0">{formatKey(key)}:</span>
                        {/* Right column: value, narrower, hidden overflow with ellipsis */}
                        <span className="text-gray-700 w-3/5 text-wrap text-ellipsis ml-2 break-all">
                            {String(value) === "" ? "Default/Empty" : String(value)}
                        </span>
                    </div>
                ))}
                {configEntries.length > 3 && ( // Only show "See More/Less" if there are more than 3 entries
                    <button
                        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                        className="text-blau-500 hover:text-blau-400 text-sm mt-2 self-start" // Align button
                    >
                        {isConfigExpanded ? 'See Less' : 'See More'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-xs border border-gray-300 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                <span className="font-bold">Project Name:</span> {formData.projectName}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-1">
                <span className="font-bold">Selected TraceLink Type:</span> {formData.selectedTraceLinkType? formData.selectedTraceLinkType.name: "None"}
            </p>
            <p className="text-sm font-medium text-gray-700 mb-4">
                <span className="font-bold">Find Inconsistencies:</span> {formData.findInconsistencies ? "Enabled" : "Disabled"}
            </p>

            <h3 className="text-md font-semibold text-gray-800 mb-2">Files:</h3>
            <div>
                {formData.files.map((uploadedFile, index) => (
                    <SummaryFileListItem key={index} uploadedFile={uploadedFile} />
                ))}
            </div>

            <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4"> {/* Added mt-4 for spacing */}
                Configuration:
                {formData.configurationSource === 'default' && (
                    <span className="text-sm font-medium text-gray-700 ml-2">Default Configuration</span>
                )}
                {formData.configurationSource === 'custom' && (
                    <span className="text-sm font-medium text-gray-700 ml-2">Custom Configuration</span>
                )}
                {!formData.configurationSource && (
                    <span className="text-sm font-medium text-gray-700 ml-2">Configuration method not selected or no configuration loaded.</span>
                )}
            </h3>

            {/* Conditionally render configuration based on source */}
            {formData.configurationSource === 'custom' && (
                <div className="p-3 bg-white rounded-md border border-gray-200">
                    {displayConfig(formData.traceLinkConfiguration)}
                </div>
            )}
            {formData.configurationSource === 'default' && (
                <div className="p-3 bg-white rounded-md border border-gray-200">
                    {displayConfig(originalTraceLinkConfiguration)} {/* Display original defaults */}
                </div>
            )}
            {!formData.configurationSource && ( // Fallback if no source is selected
                <div className="p-3 bg-white rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500 italic">No configuration details available.</p>
                </div>
            )}

        </div>
    );
}

interface SummaryFileListProps {
    uploadedFile: UploadedFile;
}


function SummaryFileListItem({ uploadedFile }: SummaryFileListProps) {
    return (
        <div
            className="flex flex-row items-center w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 shadow-xs bg-white">
            <div
                className="flex-1 truncate text-sm font-medium text-gray-700"
                title={uploadedFile.file.name}
            >
                {uploadedFile.file.name}
            </div>

            <div className="flex-1 text-sm font-medium text-gray-600 text-right">
                {uploadedFile.fileType}
            </div>
        </div>
    );
}