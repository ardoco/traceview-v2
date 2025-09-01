'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {ResultType} from "@/components/dataTypes/ResultType";

type MessageSource = 'tracelink-only' | 'element-click' | null;

interface HighlightTracelinksContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number | string | null, type: ResultType) => void;
    highlightSingleTraceLink: (traceLinks: TraceLink) => void;
    traceLinks: TraceLink[];
    traceLinkType: TraceLinkType;
    resetHighlightedTraceLinks: () => void;
    lastSearchTimestamp: number;
    messageSource: MessageSource;
    lastClickedSource: { id: string | number | null; type: ResultType } | null;
    setLastClickedSource: (id: string | number | null, type: ResultType) => void;
    loading: boolean;
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
    traceLinkType: TraceLinkType;
    useTraceLinks?: boolean;
    loading?: boolean; // indicates loading state

}

const HighlightContext = createContext<HighlightTracelinksContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export function HighlightProvider({
                                      children,
                                      traceLinks,
                                      traceLinkType,
                                      useTraceLinks = true,
                                      loading = false
                                  }: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);
    const [messageSource, setMessageSource] = useState<MessageSource>(null);
    const [lastClickedSource, setLastClickedSource] = useState<{
        id: string | number | null;
        type: ResultType
    } | null>(null);

    const highlightElement = (id: number | string | null, type: ResultType) => {
        if (!useTraceLinks) {
            return;
        }
        if (id === null) {
            setHighlightedTraceLinks([]);
            return;
        }
        let matchingTraceLinks: TraceLink[] = [];

        for (const traceLink of traceLinks) {
            if (type == ResultType.Documentation && traceLink.sentenceNumber && traceLink.sentenceNumber == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == ResultType.Architecture_Model && traceLink.modelElementId == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == ResultType.Code_Model && traceLink.codeElementId == id) {
                matchingTraceLinks.push(traceLink);
            }
        }

        setHighlightedTraceLinks(matchingTraceLinks);
        setMessageSource('element-click');
        setLastSearchTimestamp(Date.now());
        setLastClickedSource({id, type});
    };

    const highlightSingleTraceLink = (traceLink: TraceLink) => {
        if (!useTraceLinks) {
            return;
        }
        setHighlightedTraceLinks([traceLink]);
        setMessageSource('tracelink-only');
        setLastSearchTimestamp(Date.now());
        setLastClickedSource({id: traceLink.id, type: ResultType.TraceLinks});
    }

    const resetHighlightedTraceLinks = () => {
        setHighlightedTraceLinks([]);
        setMessageSource(null);
        setLastClickedSource(null);
    }

    const setLastClickedSourceGlobal = (id: string | number | null, type: ResultType) => {
        setLastClickedSource({id, type});
    };

    return (
        <HighlightContext.Provider
            value={{
                highlightedTraceLinks,
                highlightElement,
                highlightSingleTraceLink,
                traceLinks,
                traceLinkType,
                resetHighlightedTraceLinks,
                lastSearchTimestamp,
                messageSource,
                lastClickedSource,
                setLastClickedSource: setLastClickedSourceGlobal,
                loading
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
}