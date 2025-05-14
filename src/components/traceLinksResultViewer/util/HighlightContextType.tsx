'use client'

import React, {createContext, useContext, useState} from 'react';
import {ColorProvider} from '@/components/traceLinksResultViewer/util/ColorProvider';
import {TraceLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceLink";

interface HighlightContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number| string | null, type: string) => void;
    highlightSingleTraceLink: (traceLinks:TraceLink) => void;
    traceLinks:TraceLink[];
}

interface HighlightProviderProps {
    children: React.ReactNode;
    traceLinks: TraceLink[];
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export function HighlightProvider({children, traceLinks}: HighlightProviderProps) {
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<TraceLink[]>([]);
    const colorProvider = new ColorProvider();
    const highlightColor = "#8ca0d0"; // Single highlight color

    const highlightElement = (id: number| string | null, type: string) => {
        if (id === null) {
            setHighlightedTraceLinks([]);
            return;
        }
        let matchingTraceLinks: TraceLink[] = [];

        for (const traceLink of traceLinks) {
            if (type === 'sentenceId' && traceLink.sentenceId && traceLink.sentenceId == id) {
                console.log("found", traceLink);
                matchingTraceLinks.push(traceLink);
            } else if (type === 'modelElementId' && traceLink.modelElementId == id) {
                console.log("found", traceLink);
                matchingTraceLinks.push(traceLink);
            } else if (type === 'codeElementId' && traceLink.codeElementId == id) {
                console.log("found", traceLink);
                matchingTraceLinks.push(traceLink);
            }
        }
        console.log("matched tracelinks :", id, type, matchingTraceLinks, traceLinks)
        setHighlightedTraceLinks(matchingTraceLinks);
    };

    const highlightSingleTraceLink = (traceLinks:TraceLink) =>{
        setHighlightedTraceLinks([traceLinks]);
    }

    return (
        <HighlightContext.Provider
            value={{
                highlightedTraceLinks,
                highlightElement,
                highlightSingleTraceLink,
                traceLinks,
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
};
