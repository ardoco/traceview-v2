import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import React from "react";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";

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

    return (
        <li
            className={`p-2 border rounded cursor-pointer ${
                highlightedTraceLinks.includes(link) ? "" : "hover:bg-gray-100"
            }`}
            onClick={() => highlightSingleTraceLink(link)}
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
                <div className={"truncate max-w-full"} title={link.sentenceId?.toString()}>
                    <strong>Sentence:</strong> {link.sentenceId !== undefined && link.sentenceId !== null ? link.sentenceId : "N/A"}
                </div>
            )}
        </li>
    );
}
