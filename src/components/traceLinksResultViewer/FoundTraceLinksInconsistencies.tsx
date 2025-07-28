import React from "react";

interface FoundTraceLinksInconsistenciesProps {
    numberTraceLinks?: number;
    numberInconsistencies?: number;
}

export default function FoundTraceLinksInconsistencies({numberTraceLinks, numberInconsistencies}: FoundTraceLinksInconsistenciesProps) {

    if (numberTraceLinks === undefined && numberInconsistencies === undefined) {
        return null;
    }

    let numberInconsistenciesText
    let numberTraceLinksText
    let messageText

    if (numberTraceLinks) {
        numberTraceLinksText =
            numberTraceLinks === 1 ? "1 traceLink" :
            numberTraceLinks === 0 ? `no traceLinks`:
                `${numberTraceLinks} traceLinks`;
    }

    if (numberInconsistencies) {
        numberInconsistenciesText =
            numberInconsistencies === 1 ? "1 inconsistency" :
            numberInconsistencies === 0 ? `no inconsistencies`:
                `${numberInconsistencies} inconsistencies`;
    }


    if (numberTraceLinks === undefined || numberTraceLinks === null) {
        messageText = `${numberInconsistenciesText} found.`;
    } else if (numberInconsistencies === undefined || numberInconsistencies === null) {
        messageText = `${numberTraceLinksText} found.`;
    } else {
        messageText = `${numberTraceLinksText} and ${numberInconsistenciesText} found.`;
    }

    return (
        <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out-vibrate z-50"
        >
            {messageText}
        </div>
    )
}