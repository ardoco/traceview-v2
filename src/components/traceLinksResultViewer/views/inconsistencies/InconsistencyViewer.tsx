import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import React, {useMemo, useState} from "react";
import {
    InconsistencyItemDisplay
} from "@/components/traceLinksResultViewer/views/inconsistencies/viewer/InconsistencyItemDisplay";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";
import {Button} from "@headlessui/react";
import {
    InconsistencyType,
    MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import DownloadFileComponent from "@/util/DownloadFileComponent";

interface InconsistencyViewerProps {
    headerOffset?: number;
}

export default function InconsistencyViewer({headerOffset=10}: InconsistencyViewerProps) {
    const {inconsistencies} = useInconsistencyContext();
    const [filterType, setFilterType] = useState<InconsistencyType | "All">("All");

    const isLoading = inconsistencies.length === 0;

    // const handleDownloadClick = () => {
    //     const dataToExport = {inconsistencies};
    //     const data = JSON.stringify(dataToExport, null, 2);
    //     const blob = new Blob([data], {type: 'application/json'});
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'inconsistencies.json';
    //     document.body.appendChild(a);
    //     a.click();
    // };

    const prepareDataToExport = () => {
        const dataToExport = {inconsistencies};
        return JSON.stringify(dataToExport, null, 2);
    }

    const filteredAndSorted = useMemo(() => {
        let filtered = inconsistencies;

        if (filterType !== "All") {
            filtered = inconsistencies.filter(inc => inc.type === filterType);
        }

        return filtered.slice().sort((a, b) => {
            // Type first
            const typeCompare = a.type.localeCompare(b.type);
            if (typeCompare !== 0) return typeCompare;

            // Sentence number (only for MissingModelInstanceInconsistency)
            if (a instanceof MissingModelInstanceInconsistency && b instanceof MissingModelInstanceInconsistency) {
                const sentenceCompare = a.sentenceNumber - b.sentenceNumber;
                if (sentenceCompare !== 0) return sentenceCompare;
            }

            // Model element ID (only for MissingTextForModelElementInconsistency)
            if (a instanceof MissingTextForModelElementInconsistency && b instanceof MissingTextForModelElementInconsistency) {
                const idCompare = a.modelElementId.localeCompare(b.modelElementId);
                if (idCompare !== 0) return idCompare;
            }

            // Fallback: Reason
            return a.reason.localeCompare(b.reason);
        });
    }, [inconsistencies, filterType]);

    const setFilterTypeFromString = (value: string) => {
        if (value === "All") {
            setFilterType("All");
        } else {
            const type = InconsistencyType[value as keyof typeof InconsistencyType];
            if (type) {
                setFilterType(type);
            } else {
                console.warn(`Unknown inconsistency type: ${value}`);
            }
        }
    }

    if (isLoading) {
        return (
            <div className="p-2 text-center py-8 text-gray-500">
                Generating inconsistencies, this may take a few moments...
            </div>
        );
    }

    return (
        <div className="px-2 pb-2">
            {/* Sticky Top Bar */}
            <div className={`sticky top-${headerOffset} flex justify-between items-start bg-white z-10 border-b px-2 pt-2`}>

                <div className="w-full">

                    <div className="flex flex-wrap justify-between items-center gap-1 mb-2">
                        <div className="flex-1">
                            <label className="text-sm text-gray-600">Filter by: </label>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterTypeFromString(e.target.value)}
                                className={`border-gray-300 rounded px-2 py-1 pr-8 focus:ring-2 focus:outline-none text-sm`}
                            >
                                <option value="All">All Types</option>
                                <option value={InconsistencyType.MissingModelInstance}>Missing Model Instance
                                </option>
                                <option value={InconsistencyType.MissingTextForModelElement}>Missing Text For
                                    Model
                                </option>
                            </select>
                        </div>
                        {/*<Button onClick={handleDownloadClick} className="text-gray-700 hover:text-gray-500 p-1.5 -mr-2"*/}
                        {/*        title="Download Inconsistencies">*/}
                        {/*    <ArrowDownTrayIcon className="h-4"/>*/}
                        {/*</Button>*/}
                        <DownloadFileComponent
                            fileName={"inconsistencies.json"}
                            prepareDataToExport={prepareDataToExport}
                            title={"Download Inconsistencies"}
                        />

                    </div>
                </div>
            </div>

            {/* List of Inconsistencies */}
            <ul className="space-y-2 max-h-full overflow-y-auto pt-2">
                {filteredAndSorted.map((inconsistency, index) => (
                    <InconsistencyItemDisplay
                        inconsistency={inconsistency}
                        index={index}
                        key={index}
                    />
                ))}
            </ul>

            <div className="z-10">
                <TooltipInstruction
                    title="Instructions"
                    position="bottom-right"
                    instructions={[
                        {
                            keyCombo: "Click",
                            description: "Highlight Inconsistency. An inconsistency can be two things: " +
                                "1) A sentence in the documentation, which is not represented in the architecture model, or " +
                                "2) An element in the architecture model, which cannot be fitted with a sentence in the documentation."
                        },
                    ]}
                />
            </div>

        </div>
    );
}