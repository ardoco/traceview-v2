'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

type MessageSource = 'tracelink-only' | 'element-click' | null;
type ClickedElementType = 'sentence' | 'model' | 'codeElementId' | 'tracelink' | 'inconsistency' | null; // New type

interface HighlightTracelinksContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number| string | null, type: string) => void;
    highlightSingleTraceLink: (traceLinks:TraceLink) => void;
    traceLinks:TraceLink[];
    resetHighlightedTraceLinks: () => void;
    lastSearchTimestamp: number;
    messageSource: MessageSource;
    lastClickedSource: { id: string | number | null; type: ClickedElementType } | null;
    setLastClickedSource: (id: string | number | null, type: ClickedElementType) => void;
    loading: boolean;
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
    useTraceLinks?: boolean;
    loading?: boolean; // Optional prop to indicate loading state
}

const HighlightContext = createContext<HighlightTracelinksContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export function HighlightProvider({children, traceLinks, useTraceLinks=true, loading=false}: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);
    const [messageSource, setMessageSource] = useState<MessageSource>(null);
    const [lastClickedSource, setLastClickedSource] = useState<{ id: string | number | null; type: ClickedElementType } | null>(null);

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
        setLastClickedSource({ id, type: type as ClickedElementType });
    };

    const highlightSingleTraceLink = (traceLink:TraceLink) =>{
        if (!useTraceLinks) {
            return;
        }
        setHighlightedTraceLinks([traceLink]);
        setMessageSource('tracelink-only');
        setLastSearchTimestamp(Date.now());
        setLastClickedSource({ id: traceLink.id, type: 'tracelink' });
    }

    const resetHighlightedTraceLinks = () => {
        setHighlightedTraceLinks([]);
        setMessageSource(null);
        setLastClickedSource(null);
    }

    const setLastClickedSourceGlobal = (id: string | number | null, type: ClickedElementType) => {
        setLastClickedSource({ id, type });
    };

    return (
        <HighlightContext.Provider
            value={{
                highlightedTraceLinks,
                highlightElement,
                highlightSingleTraceLink,
                traceLinks,
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