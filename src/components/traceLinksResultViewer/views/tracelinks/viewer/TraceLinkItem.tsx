import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import React from "react";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import clsx from "clsx";

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

    const isSource = lastClickedSource?.type === 'tracelink' && lastClickedSource?.id === link.id;

    return (
        <li
            className={clsx("p-2 border rounded-lg cursor-pointer",
                highlightedTraceLinks.includes(link) ? "bg-highlight-tracelink" : "bg-highlight-none hover:bg-gray-100",
                isSource && "border-2 border-highlight-source shadow-highlight-source",
            )
            }
            onClick={() => {
                resetHighlightedInconsistencies();
                highlightSingleTraceLink(link);
            }}
        >
            {showCode && (
                <div className={"truncate"} title={`id: ${link.codeElementId}`}>
                    <strong>Code Name:</strong> {link.codeElementName || link.codeElementId || "N/A"}
                </div>
            )}
            {showModel && (
                <div className={"truncate max-w-full"} title={`id: ${link.modelElementId}`}>
                    <strong>Model Name:</strong> {link.modelElementName || link.modelElementId || "N/A"}
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