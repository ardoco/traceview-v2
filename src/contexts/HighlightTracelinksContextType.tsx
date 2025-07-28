'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

type MessageSource = 'tracelink-only' | 'element-click' | null;

interface HighlightTracelinksContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number| string | null, type: string) => void;
    highlightSingleTraceLink: (traceLinks:TraceLink) => void;
    traceLinks:TraceLink[];
    resetHighlightedTraceLinks: () => void;
    lastSearchTimestamp: number;
    messageSource: MessageSource;
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
    useTraceLinks?: boolean;
}

const HighlightContext = createContext<HighlightTracelinksContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export function HighlightProvider({children, traceLinks, useTraceLinks=true}: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);
    const [messageSource, setMessageSource] = useState<MessageSource>(null);

    const highlightElement = (id: number| string | null, type: string) => {
        if (!useTraceLinks) {
            return;
        }
        if (id === null) {
            setHighlightedTraceLinks([]);
            return;
        }
        let matchingTraceLinks: TraceLink[] = [];

        for (const traceLink of traceLinks) {
            if (type == 'sentenceId' && traceLink.sentenceNumber && traceLink.sentenceNumber == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == 'modelElementId' && traceLink.modelElementId == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == 'codeElementId' && traceLink.codeElementId == id) {
                matchingTraceLinks.push(traceLink);
            }
        }

        setHighlightedTraceLinks(matchingTraceLinks);
        setMessageSource('element-click');
        setLastSearchTimestamp(Date.now());
    };

    const highlightSingleTraceLink = (traceLinks:TraceLink) =>{
        if (!useTraceLinks) {
            return;
        }
        setHighlightedTraceLinks([traceLinks]);
        setMessageSource('tracelink-only');
        setLastSearchTimestamp(Date.now());
    }

    const resetHighlightedTraceLinks = () => {
        setHighlightedTraceLinks([]);
        setMessageSource(null);
    }

    return (
        <HighlightContext.Provider
            value={{
                highlightedTraceLinks,
                highlightElement,
                highlightSingleTraceLink,
                traceLinks,
                resetHighlightedTraceLinks,
                lastSearchTimestamp,
                messageSource
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
}