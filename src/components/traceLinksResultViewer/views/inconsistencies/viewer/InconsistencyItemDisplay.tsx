import React from "react";
import {
    Inconsistency,
    InconsistencyType, MissingModelInstanceInconsistency, MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";


export function InconsistencyItemDisplay({inconsistency, index}: { inconsistency: Inconsistency, index: number }) {
    const {highlightedInconsistencies, highlightSingleInconsistency, highlightingColorInconsistencies} = useInconsistencyContext()
    const {resetHighlightedTraceLinks} = useHighlightContext()
    const showSentenceNumber = inconsistency.type === InconsistencyType.MissingModelInstance;
    const showModelElement = inconsistency.type === InconsistencyType.MissingTextForModelElement;

    if ( !inconsistency) {
        return null;
    }

    return (
        <div
            className={`p-2 border rounded-lg transition cursor-pointer hover:bg-gray-200`}
            onClick={() => {
                highlightSingleInconsistency(inconsistency)
                resetHighlightedTraceLinks()
            }}
            style={{
                backgroundColor: highlightedInconsistencies.includes(inconsistency)
                    ? highlightingColorInconsistencies
                    : undefined
            }}
        >
            {/*<span className="mr-3 font-bold text-gray-600">{index}.</span>*/}

            <p className="flex-1 text-black"><strong>Type: </strong>{inconsistency.type}</p>

            {showSentenceNumber && (
                <p className="flex-1 text-black">
                    <strong>Sentence: </strong>
                    {(inconsistency as MissingModelInstanceInconsistency).sentenceNumber?.toString() || "N/A"}
                </p>
            )}

            {showModelElement && (
                <p className="flex-1 text-black">
                    <strong>Model Id: </strong>
                    {(inconsistency as MissingTextForModelElementInconsistency).modelElementId?.toString() || "N/A"}
                </p>
            )}

            <p className="flex-1 text-black">
                <strong>Reason: </strong>
                {inconsistency.reason || "No provided provided"}
            </p>
        </div>
    )
}

