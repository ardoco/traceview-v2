'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";
import {MessageSource} from "@/components/dataTypes/MessageSource";

interface HighlightTracelinksContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number | string | null, type: DisplayOption) => void;
    highlightSingleTraceLink: (traceLinks: TraceLink) => void;
    traceLinks: TraceLink[];
    traceLinkType: TraceLinkType;
    resetHighlightedTraceLinks: () => void;
    lastSearchTimestamp: number;
    messageSource: MessageSource;
    lastClickedSource: { id: string | number | null; type: DisplayOption } | null;
    setLastClickedSource: (id: string | number | null, type: DisplayOption) => void;
    loading: boolean;
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
    traceLinkType: TraceLinkType;
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
                                      loading = false
                                  }: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);
    const [messageSource, setMessageSource] = useState<MessageSource>(MessageSource.NONE);
    const [lastClickedSource, setLastClickedSource] = useState<{
        id: string | number | null;
        type: DisplayOption
    } | null>(null);
    const useTraceLinks = traceLinks && traceLinks.length > 0;

    const highlightElement = (id: number | string | null, type: DisplayOption) => {
        if (!useTraceLinks) {
            return;
        }
        if (id === null) {
            setHighlightedTraceLinks([]);
            return;
        }
        const matchingTraceLinks: TraceLink[] = [];

        for (const traceLink of traceLinks) {
            if (type == DisplayOption.DOCUMENTATION && traceLink.sentenceNumber && traceLink.sentenceNumber == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == DisplayOption.ARCHITECTURE_MODEL && traceLink.modelElementId == id) {
                matchingTraceLinks.push(traceLink);
            } else if (type == DisplayOption.CODE_MODEL && traceLink.codeElementId == id) {
                matchingTraceLinks.push(traceLink);
            }
        }

        setHighlightedTraceLinks(matchingTraceLinks);
        setMessageSource(MessageSource.ELEMENT_CLICK);
        setLastSearchTimestamp(Date.now());
        setLastClickedSource({id, type});
    };

    const highlightSingleTraceLink = (traceLink: TraceLink) => {
        if (!useTraceLinks) {
            return;
        }
        setHighlightedTraceLinks([traceLink]);
        setMessageSource(MessageSource.TRACELINK_ONLY);
        setLastSearchTimestamp(Date.now());
        setLastClickedSource({id: traceLink.id, type: DisplayOption.TRACELINKS});
    }

    const resetHighlightedTraceLinks = () => {
        setHighlightedTraceLinks([]);
        setMessageSource(MessageSource.NONE);
        setLastClickedSource(null);
    }

    const setLastClickedSourceGlobal = (id: string | number | null, type: DisplayOption) => {
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