import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import React from "react";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import clsx from "clsx";
import {ResultType} from "@/components/dataTypes/ResultType";

export function SentenceView({sentence}: { sentence: Sentence }) {
    const {highlightElement, highlightedTraceLinks, lastClickedSource} = useHighlightContext();
    const {
        highlightedSentenceInconsistencies,
        highlightInconsistencyWithSentence,
    } = useInconsistencyContext();

    const traceLinkHighlight = highlightedTraceLinks.find(traceLink => traceLink.sentenceNumber === sentence.identifier) !== undefined;
    const inconsistencyHighlight = highlightedSentenceInconsistencies.find(inc => inc.sentenceNumber == sentence.identifier) !== undefined;

    const isSource = lastClickedSource?.type ==  ResultType.Documentation && lastClickedSource?.id === sentence.identifier;

    const backgroundClass = clsx(
        {
            "hover:bg-gray-100 bg-highlight-none": !traceLinkHighlight && !inconsistencyHighlight,
            "bg-highlight-inconsistency": !traceLinkHighlight && inconsistencyHighlight,
            "bg-highlight-tracelink": traceLinkHighlight && !inconsistencyHighlight,
            "bg-gradient-to-r from-highlight-tracelink to-highlight-inconsistency":
                traceLinkHighlight && inconsistencyHighlight,
        }
    );

    const borderClass = clsx(
        {
            "border-2 border-highlight-tracelink-text shadow-highlight-tracelink-text":
                isSource && traceLinkHighlight,
            "border-2 border-highlight-inconsistency-text shadow-highlight-inconsistency-text":
                isSource && inconsistencyHighlight,
            "border-2 border-highlight-source shadow-highlight-source":
                isSource && !traceLinkHighlight && !inconsistencyHighlight,
        }
    );

    return (
        <div
            className={clsx(
                "flex items-center p-2 rounded-lg transition cursor-pointer",
                backgroundClass,
                borderClass
            )}
            onClick={() => {
                highlightElement(sentence.identifier, ResultType.Documentation)
                highlightInconsistencyWithSentence(sentence.identifier);
            }}
        >
            <span className="mr-3 font-bold">{sentence.identifier}.</span>
            <p className="flex-1 text-black">{sentence.getContent()}</p>

        </div>
    );
}