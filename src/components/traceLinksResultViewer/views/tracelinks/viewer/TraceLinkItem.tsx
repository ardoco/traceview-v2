import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import React from "react";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import clsx from "clsx";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";

/**
 * Defines the props for the TraceLinkItem component.
 */
interface TraceLinkItemProps {
    link: TraceLink;
    showCode: boolean;
    showModel: boolean;
    showSentence: boolean;
}

export function TraceLinkItem({link, showCode, showModel, showSentence}: TraceLinkItemProps) {
    const {highlightSingleTraceLink, highlightedTraceLinks, lastClickedSource} = useHighlightContext();
    const {resetHighlightedInconsistencies} = useInconsistencyContext();

    const isSource = lastClickedSource?.type === DisplayOption.TRACELINKS && lastClickedSource?.id === link.id;

    const isHighlighted = highlightedTraceLinks.includes(link);

    return (
        <li>
            <button
                type="button"
                aria-pressed={isHighlighted}
                className={clsx("block w-full text-left p-2 border rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blau-500",
                    isHighlighted ? "bg-highlight-tracelink" : "bg-highlight-none hover:bg-gray-100",
                    isSource && "border-2 border-highlight-tracelink-text shadow-highlight-tracelink-text",
                )}
                onClick={() => {
                    resetHighlightedInconsistencies();
                    highlightSingleTraceLink(link);
                }}
            >
                {showCode && (
                    <span className="block truncate" title={`id: ${link.codeElementId}`}>
                        <strong>Code Name:</strong> {link.codeElementName || link.codeElementId || "N/A"}
                    </span>
                )}
                {showModel && (
                    <span className="block truncate max-w-full" title={`id: ${link.modelElementId}`}>
                        <strong>Model Name:</strong> {link.modelElementName || link.modelElementId || "N/A"}
                    </span>
                )}
                {showSentence && (
                    <span className="block truncate max-w-full" title={link.sentenceNumber?.toString()}>
                        <strong>Sentence:</strong> {link.sentenceNumber?.toString() || "N/A"}
                    </span>
                )}
            </button>
        </li>
    );
}
