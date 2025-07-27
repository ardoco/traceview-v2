import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import React from "react";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";

export function SentenceView({sentence}: { sentence: Sentence}) {
    const {highlightElement, highlightedTraceLinks, highlightingColor} = useHighlightContext();
    const {highlightedSentenceInconsistencies, highlightInconsistencyWithSentence, highlightingColorInconsistencies} = useInconsistencyContext();

    const findBackgroundStyle = (sentenceIndex: number): React.CSSProperties => {
        const traceLinkHighlight = highlightedTraceLinks.find(traceLink => traceLink.sentenceNumber === sentenceIndex);
        const inconsistencyHighlight = highlightedSentenceInconsistencies.find(inc => inc.sentenceNumber === sentenceIndex);

        if (traceLinkHighlight && inconsistencyHighlight) {
            return { background: `linear-gradient(to right, ${highlightingColor}, ${highlightingColorInconsistencies})` };
        } else if (traceLinkHighlight) {
            return { backgroundColor: highlightingColor };
        } else if (inconsistencyHighlight) {
            return { backgroundColor: highlightingColorInconsistencies };
        } else {
            return { backgroundColor: "transparent" };
        }
    };

    return (
        <div
            className={`flex items-center p-2 rounded-lg transition cursor-pointer hover:bg-gray-200`}
            onClick={() => {
                highlightElement(sentence.identifier, "sentenceId")
                highlightInconsistencyWithSentence(sentence.identifier);
            }}
            style={findBackgroundStyle(sentence.identifier)}
        >
            <span className="mr-3 font-bold text-gray-600">{sentence.identifier}.</span>
            <p className="flex-1 text-black">{sentence.getContent()}</p>

        </div>
    );
}