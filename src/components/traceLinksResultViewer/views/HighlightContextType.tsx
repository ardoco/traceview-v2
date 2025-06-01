'use client'

import React, {createContext, useContext, useState} from 'react';
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

interface HighlightContextType {
    highlightedTraceLinks: TraceLink[];
    highlightElement: (id: number| string | null, type: string) => void;
    highlightSingleTraceLink: (traceLinks:TraceLink) => void;
    traceLinks:TraceLink[];
    highlightingColor: string;
    showNoTraceLinksMessage: boolean;
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
    const [showNoTraceLinksMessage, setShowNoTraceLinksMessage] = useState(false);

    const highlightingColor = "#fde047"; // Highlight color

    const highlightElement = (id: number| string | null, type: string) => {
        if (id === null) {
            setHighlightedTraceLinks([]);
            return;
        }
        let matchingTraceLinks: TraceLink[] = [];
        console.log(id, typeof id, traceLinks[0].sentenceId, typeof traceLinks[0].sentenceId);

        for (const traceLink of traceLinks) {
            if (type == 'sentenceId' && traceLink.sentenceId && traceLink.sentenceId == id) {
                console.log("found", traceLink);
                matchingTraceLinks.push(traceLink);
            } else if (type == 'modelElementId' && traceLink.modelElementId == id) {
                console.log("found", traceLink);
                matchingTraceLinks.push(traceLink);
            } else if (type == 'codeElementId' && traceLink.codeElementId == id) {
                console.log("found", traceLink);
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
                highlightingColor,
                showNoTraceLinksMessage
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
}
