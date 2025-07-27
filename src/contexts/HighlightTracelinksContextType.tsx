'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

interface HighlightTracelinksContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number| string | null, type: string) => void;
    highlightSingleTraceLink: (traceLinks:TraceLink) => void;
    traceLinks:TraceLink[];
    highlightingColor: string;
    showNoTraceLinksMessage: boolean;
    resetHighlightedTraceLinks: () => void;
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
}

const HighlightContext = createContext<HighlightTracelinksContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export function HighlightProvider({children, traceLinks}: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const [showNoTraceLinksMessage, setShowNoTraceLinksMessage] = useState(false);

    const highlightingColor = "#fde047"; // Highlight color

    const highlightElement = (id: number| string | null, type: string) => {
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

        if (matchingTraceLinks.length === 0) {
            setShowNoTraceLinksMessage(false);
            requestAnimationFrame(() => {
                setShowNoTraceLinksMessage(true);
            });
            setTimeout(() => {
                setShowNoTraceLinksMessage(false);
            }, 2000);
        }
        setHighlightedTraceLinks(matchingTraceLinks);
    };

    const highlightSingleTraceLink = (traceLinks:TraceLink) =>{
        setHighlightedTraceLinks([traceLinks]);
    }

    const resetHighlightedTraceLinks = () => {
        setHighlightedTraceLinks([]);
        setShowNoTraceLinksMessage(false);
    }

    return (
        <HighlightContext.Provider
            value={{
                highlightedTraceLinks,
                highlightElement,
                highlightSingleTraceLink,
                traceLinks,
                highlightingColor,
                showNoTraceLinksMessage,
                resetHighlightedTraceLinks
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
}
