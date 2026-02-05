import React from "react";
import {
    Inconsistency,
    InconsistencyType,
    TextEntityAbsentFromModelInconsistency,
    ModelEntityAbsentFromTextInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import clsx from "clsx";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";


export function InconsistencyItemDisplay({inconsistency}: { inconsistency: Inconsistency }) {
    const {highlightedInconsistencies, highlightSingleInconsistency} = useInconsistencyContext()
    const {resetHighlightedTraceLinks, lastClickedSource} = useHighlightContext()
    const showSentenceNumber = inconsistency.type === InconsistencyType.TextEntityAbsentFromModel;
    const showModelElement = inconsistency.type === InconsistencyType.ModelEntityAbsentFromText;
    const isSource = lastClickedSource?.type === DisplayOption.INCONSISTENCIES && lastClickedSource?.id === inconsistency.id;

    if (!inconsistency) {
        return null;
    }

    return (
        <div
            className={clsx("p-2 border rounded-lg transition cursor-pointer ",
                highlightedInconsistencies.includes(inconsistency) ? "bg-highlight-inconsistency" : "bg-highlight-none hover:bg-gray-100",
                isSource && "border-2 border-highlight-inconsistency-text shadow-highlight-inconsistency-text",
            )}
            onClick={() => {
                resetHighlightedTraceLinks()
                highlightSingleInconsistency(inconsistency)
            }}
        >
            <p className="flex-1 text-black"><strong>Type: </strong>{inconsistency.type}</p>

            {showSentenceNumber && (
                <p className="flex-1 text-black">
                    <strong>Sentence: </strong>
                    {(inconsistency as TextEntityAbsentFromModelInconsistency).sentenceNumber?.toString() || "N/A"}
                </p>
            )}

            {showModelElement && (
                <p className="flex-1 text-black">
                    <strong>Model Id: </strong>
                    {(inconsistency as ModelEntityAbsentFromTextInconsistency).modelElementId?.toString() || "N/A"}
                </p>
            )}

            <p className="flex-1 text-black">
                <strong>Reason: </strong>
                {inconsistency.reason || "No provided provided"}
            </p>
        </div>
    )
}

