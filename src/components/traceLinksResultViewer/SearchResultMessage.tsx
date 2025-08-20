import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";

interface SearchResultMessageProps {
    displayOptions: ResultPanelType[];
}

interface MessagePart {
    text: string;
    type: 'tracelink' | 'inconsistency' | 'normal';
}

export function SearchResultMessage({displayOptions}: SearchResultMessageProps) {
    const [messageVisible, setMessageVisible] = useState(false);
    const [messageParts, setMessageParts] = useState<MessagePart[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messageRef = useRef<HTMLDivElement | null>(null);

    const {
        highlightedTraceLinks,
        lastSearchTimestamp: traceLinkTimestamp,
        messageSource: traceLinkSource
    } = useHighlightContext();

    const {
        highlightedInconsistencies,
        lastSearchTimestamp: inconsistencyTimestamp,
        messageSource: inconsistencySource
    } = useInconsistencyContext();

    const displayTraceLinks = displayOptions.includes(ResultPanelType.TraceLinks);
    const displayInconsistencies = displayOptions.includes(ResultPanelType.Inconsistencies);

    // Compute current message data based on the latest trigger
    const currentMessage = useMemo(() => {
        const traceCount = highlightedTraceLinks.length;
        const inconsistencyCount = highlightedInconsistencies.length;

        const source =
            traceLinkTimestamp > inconsistencyTimestamp
                ? traceLinkSource || 'element-click'
                : inconsistencyTimestamp > traceLinkTimestamp
                    ? inconsistencySource || 'element-click'
                    : traceLinkTimestamp > 0 ? 'element-click' : 'none';

        const parts: MessagePart[] = [];

        if (source === 'tracelink-only' && displayTraceLinks) {
            parts.push(
                {
                    text: traceCount === 0 ? 'no traceLinks' :
                        traceCount === 1 ? '1 traceLink' : `${traceCount} traceLinks`,
                    type: 'tracelink'
                },
                {text: ' found.', type: 'normal'}
            );
        } else if (source === 'inconsistency-only' && displayInconsistencies) {
            parts.push(
                {
                    text: inconsistencyCount === 0 ? 'no inconsistencies' :
                        inconsistencyCount === 1 ? '1 inconsistency' : `${inconsistencyCount} inconsistencies`,
                    type: 'inconsistency'
                },
                {text: ' found.', type: 'normal'}
            );
        } else if (source === 'element-click') {
            if (displayTraceLinks) {
                parts.push({
                    text: traceCount === 0 ? 'no traceLinks' :
                        traceCount === 1 ? '1 traceLink' : `${traceCount} traceLinks`,
                    type: 'tracelink'
                });
            }

            if (displayInconsistencies) {
                if (parts.length > 0) {
                    parts.push({text: ' and ', type: 'normal'});
                }
                parts.push({
                    text: inconsistencyCount === 0 ? 'no inconsistencies' :
                        inconsistencyCount === 1 ? '1 inconsistency' : `${inconsistencyCount} inconsistencies`,
                    type: 'inconsistency'
                });
            }

            if (parts.length > 0) {
                parts.push({text: ' found.', type: 'normal'});
            }
        }

        return {parts, shouldShow: parts.length > 0};
    }, [traceLinkTimestamp, inconsistencyTimestamp, traceLinkSource, inconsistencySource, displayTraceLinks, displayInconsistencies, highlightedTraceLinks.length, highlightedInconsistencies.length]);

    useEffect(() => {
        if (!currentMessage.shouldShow) return;

        setMessageParts(currentMessage.parts);

        requestAnimationFrame(() => {
            const el = messageRef.current;
            if (el) {
                // Remove and re-add the class to restart the animation
                el.classList.remove('animate-blink');
                void el.offsetWidth; // Force reflow
                el.classList.add('animate-blink');
            }
            setMessageVisible(true);
        });

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setMessageVisible(false);
        }, 2000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentMessage]);

    if (!messageVisible || messageParts.length === 0) return null;

    return (
        <div
            ref={messageRef}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg border border-gray-200 z-50 animate-blink"
        >
            {messageParts.map((part, index) => {
                let className = "";
                if (part.type === 'tracelink') {
                    className = "font-semibold text-highlight-tracelink-text animate-blink";
                } else if (part.type === 'inconsistency') {
                    className = "font-semibold text-highlight-inconsistency-text ";
                } else {
                    className = "text-gray-800 ";
                }

                return (
                    <span key={index} className={className}>
                    {part.text}
                </span>
                );
            })}
        </div>
    );
}
