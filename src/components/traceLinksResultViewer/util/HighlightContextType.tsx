'use client'

import React, { createContext, useContext, useState } from 'react';
import { ColorProvider } from '@/components/traceLinksResultViewer/util/ColorProvider';
import {TraceLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceLink";

interface HighlightContextType {
    tracelinks: TraceLink[];
    highlightedTraceLinks: Set<TraceLink>;
    setTracelinks: (tracelinks: TraceLink[]) => void;
    highlightElement: (id: string, type: string) => void;
    subscribe: (callback: () => void) => void;
    unsubscribe: (callback: () => void) => void;
}

interface HighlightProviderProps {
    children: React.ReactNode;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const useHighlightContext = () => {
    const context = useContext(HighlightContext);
    if (!context) {
        throw new Error('useHighlightContext must be used within a HighlightProvider');
    }
    return context;
};

export const HighlightProvider: React.FC<HighlightProviderProps> = ({ children }) => {
    const [tracelinks, setTracelinksState] = useState<TraceLink[]>([]);
    const [highlightedTraceLinks, setHighlightedTraceLinks] = useState<Set<TraceLink>>(new Set());
    const [observers, setObservers] = useState<(() => void)[]>([]);
    const colorProvider = new ColorProvider();
    const highlightColor = "#8ca0d0"; // Single highlight color

    const subscribe = (callback: () => void) => {
        if (!observers.includes(callback)) {
            setObservers((prev) => [...prev, callback]);
        }

    };

    const unsubscribe = (callback: () => void) => {
        setObservers((prev) => prev.filter((cb) => cb !== callback));
    };

    const notify = () => {
        observers.forEach((callback) => callback());
    };

    const highlightElement = (id: string, type: string) => {
        let matchingTraceLinks: TraceLink[] = [];
        console.log(id, type)
        if (type === 'sentenceId') {
            matchingTraceLinks = tracelinks.filter((link) => link.sentenceId + 1 == id);
        } else if (type === 'modelElementId') {
            matchingTraceLinks = tracelinks.filter((link) => link.modelElementId === id);
        } else if (type === 'codeElementId') {
            matchingTraceLinks = tracelinks.filter((link) => link.codeElementId === id);
        }
        console.log("matched tracelinks ",matchingTraceLinks)

        if (matchingTraceLinks.length === 0) {
            setHighlightedTraceLinks(new Set<TraceLink>());
            notify();
            return;
        }

        setHighlightedTraceLinks(new Set(matchingTraceLinks));
        notify();
    };

    return (
        <HighlightContext.Provider
            value={{
                tracelinks,
                highlightedTraceLinks,
                setTracelinks: setTracelinksState,
                highlightElement,
                subscribe,
                unsubscribe,
            }}
        >
            {children}
        </HighlightContext.Provider>
    );
};
