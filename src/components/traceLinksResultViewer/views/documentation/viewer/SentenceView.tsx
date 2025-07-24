import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import {useHighlightContext} from "@/contexts/HighlightContextType";
import React from "react";

export function SentenceView({sentence, index}: { sentence: Sentence, index: number }) {
    const {highlightElement, highlightedTraceLinks, highlightingColor} = useHighlightContext();

    return (
        <div
            className={`flex items-center p-2 rounded-lg transition cursor-pointer hover:bg-gray-200`}
            onClick={() => highlightElement(index, "sentenceId")}
            style={{
                backgroundColor: highlightedTraceLinks.some(traceLink => traceLink.sentenceNumber == index)
                    ? highlightingColor
                    : undefined
            }}
        >
            <span className="mr-3 font-bold text-gray-600">{index}.</span>
            <p className="flex-1 text-black">{sentence.getContent()}</p>

        </div>
    );
}