import React, {useState} from 'react';
import {TraceLinkConfiguration, useFormContext} from "@/contexts/ProjectUploadContext";
import {SummaryFileListItem} from "@/components/multiStepForm/steps/summayStep/SummaryFileListItem";

export default function SummaryStep() {
    const {formData} = useFormContext();
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);

    const formatKey = (key: string): string => {
        let formatted = key.replace(/::/g, ':: ');
        formatted = formatted.trim();
        // Capitalize first letter of each word, handle special cases
        formatted = formatted.split(' ').map(word => {
            if (word.toLowerCase() === 'url') return 'URL';
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        return formatted;
    };

    const displayConfig = (config: TraceLinkConfiguration | null) => {
        if (!config || Object.keys(config).length === 0) {
            return <p className="text-sm text-gray-500 italic">No configuration details available.</p>;
        }
        const configEntries = Object.entries(config);
        const visibleEntries = isConfigExpanded ? configEntries : configEntries.slice(0, 3);

        return (
            <div className="flex flex-col space-y-1">
                {visibleEntries.map(([key, value]) => (
                    <div key={key} className="flex text-sm">
                        <span className="font-medium text-gray-700 w-2/5 flex-shrink-0">{formatKey(key)}:</span>
                        <span className="text-gray-700 w-3/5 text-wrap text-ellipsis ml-2 break-all">
                            {String(value) === "" ? "Default/Empty" : String(value)}
                        </span>
                    </div>
                ))}
                {configEntries.length > 3 && (
                    <button
                        onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                        className="text-blau-500 hover:text-blau-400 text-sm mt-2 self-start"
                    >
                        {isConfigExpanded ? 'See Less' : 'See More'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-xs border border-gray-300 mb-4">
            <SummaryItem
                label={"Project Name"}
                inlineValue={formData.projectName}
                marginBottom={1}
            />
            <SummaryItem
                label={"Selected TraceLink Type"}
                inlineValue={formData.selectedTraceLinkType ? formData.selectedTraceLinkType.name : "None"}
                marginBottom={1}
            />
            <SummaryItem
                label={"Find Inconsistencies"}
                inlineValue={formData.findInconsistencies ? "Enabled" : "Disabled"}
                marginBottom={4}
            />

            <SummaryItem label={"Files"} marginBottom={2}/>
            {formData.files.map((uploadedFile, index) => (
                <SummaryFileListItem key={index} uploadedFile={uploadedFile}/>
            ))}

            <SummaryItem label={"Configuration"} marginBottom={2}/>
            <div className="p-3 bg-white rounded-md border border-gray-200">
                {displayConfig(formData.traceLinkConfiguration)}
            </div>

        </div>
    );
}

interface SummaryItemProps {
    label: string;
    inlineValue?: string;
    marginBottom?: number;
}

function SummaryItem({label, inlineValue, marginBottom = 2}: SummaryItemProps) {
    return (
        <h3 className={`text-md font-semibold text-gray-800  mb-${marginBottom}`}>
            {label}:
            {inlineValue && <span className="text-grey-700 font-medium text-sm ml-2">{inlineValue}</span>}
        </h3>
    )
}