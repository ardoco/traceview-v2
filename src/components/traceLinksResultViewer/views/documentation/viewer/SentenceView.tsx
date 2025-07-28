import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import React from "react";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import clsx from "clsx";

export function SentenceView({sentence}: { sentence: Sentence }) {
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();
    const {
        highlightedSentenceInconsistencies,
        highlightInconsistencyWithSentence,
    } = useInconsistencyContext();

    const traceLinkHighlight = highlightedTraceLinks.find(traceLink => traceLink.sentenceNumber === sentence.identifier);
    const inconsistencyHighlight = highlightedSentenceInconsistencies.find(inc => inc.sentenceNumber === sentence.identifier);

    return (
        <div
            className={clsx("flex items-center p-2 rounded-lg transition cursor-pointer hover:bg-gray-200 bg-highlight-none",
                !traceLinkHighlight && inconsistencyHighlight && "bg-highlight-inconsistency",
                traceLinkHighlight && !inconsistencyHighlight && "bg-highlight-tracelink",
                traceLinkHighlight && inconsistencyHighlight && "bg-gradient-to-r from-highlight-tracelink to-highlight-inconsistency",
            )}
            onClick={() => {
                highlightElement(sentence.identifier, "sentenceId")
                highlightInconsistencyWithSentence(sentence.identifier);
            }}
        >
            <span className="mr-3 font-bold text-gray-600">{sentence.identifier}.</span>
            <p className="flex-1 text-black">{sentence.getContent()}</p>

        </div>
    );
}