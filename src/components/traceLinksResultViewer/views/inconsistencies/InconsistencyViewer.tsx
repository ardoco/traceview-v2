import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import React, {useMemo, useState} from "react";
import {
    InconsistencyItemDisplay
} from "@/components/traceLinksResultViewer/views/inconsistencies/viewer/InconsistencyItemDisplay";
import {
    InconsistencyType,
    MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import DownloadFileComponent from "@/util/DownloadFileComponent";
import LoadingMessage, {ErrorMessage} from "@/components/traceLinksResultViewer/Loading";

interface InconsistencyViewerProps {
    headerOffset?: number;
}

export default function InconsistencyViewer({headerOffset = 10}: InconsistencyViewerProps) {
    const {inconsistencies, loading} = useInconsistencyContext();
    const [filterType, setFilterType] = useState<InconsistencyType | "All">("All");

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

    if (loading) {
        return <LoadingMessage title={"Generating inconsistencies, this may take a few moments..."} />;
    }

    if (!loading && inconsistencies.length === 0) {
        return <LoadingMessage title={"No inconsistencies found."} />;

    }

    return (
        <div className="px-2 pb-2">
            {/* Sticky Top Bar */}
            <div
                className={`sticky top-${headerOffset} flex justify-between items-start bg-white z-10 border-b px-2 pt-2`}>

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