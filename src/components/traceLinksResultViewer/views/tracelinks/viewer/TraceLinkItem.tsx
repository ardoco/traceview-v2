import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import React from "react";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";

/**
 * Defines the props for the TraceLinkItem component.
 */
interface TraceLinkItemProps {
    link: TraceLink;
    showCode: boolean;
    showModel: boolean;
    showSentence: boolean;
}

export function TraceLinkItem ({link, showCode, showModel, showSentence}:TraceLinkItemProps) {
    const { highlightSingleTraceLink, highlightedTraceLinks, highlightingColor } = useHighlightContext();
    const {resetHighlightedInconsistencies} = useInconsistencyContext();
    return (
        <li
            className={`p-2 border rounded-lg cursor-pointer ${
                highlightedTraceLinks.includes(link) ? "" : "hover:bg-gray-100"
            }`}
            onClick={() => {
                highlightSingleTraceLink(link);
                resetHighlightedInconsistencies();
            }}
            style={{backgroundColor: highlightedTraceLinks.includes(link) ? highlightingColor : "transparent"}}
        >
            {showCode && (
                <div className={"truncate"} title={link.codeElementId}>
                    <strong>Code Id:</strong> {link.codeElementId || "N/A"}
                </div>
            )}
            {showModel && (
                <div className={"truncate max-w-full"} title={link.modelElementId}>
                    <strong>Model Id:</strong> {link.modelElementId || "N/A"}
                </div>
            )}
            {showSentence && (
                <div className={"truncate max-w-full"} title={link.sentenceNumber?.toString()}>
                    <strong>Sentence:</strong> {link.sentenceNumber?.toString() || "N/A"}
                </div>
            )}
        </li>
    );
}
