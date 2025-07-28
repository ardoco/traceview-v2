'use client'

import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import React, {useEffect, useState} from "react";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import FullScreenResultDialog from "@/components/traceLinksResultViewer/FullScreenResult";
import ResultPanelsLayout from "@/components/traceLinksResultViewer/ResultPanelLayout";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import NoTraceLinksMessage from "@/components/traceLinksResultViewer/NoTraceLinksMessage";
import FoundTraceLinksInconsistencies from "@/components/traceLinksResultViewer/FoundTraceLinksInconsistencies";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";

interface ResultDisplayProps {
    id: string;
    traceLinkType: TraceLinkType;
    displayOptions: ResultPanelType[];
    inconsistencies?: boolean; // Optional prop to control if inconsistencies are displayed
}

export function ResultDisplay({id, traceLinkType, displayOptions, inconsistencies }:ResultDisplayProps) {

    const [selectedDialogView, setSelectedDialogView] = useState<ResultPanelType | null>(null);

    const { highlightedTraceLinks, lastSearchTimestamp: traceLinkTimestamp } = useHighlightContext();
    const { highlightedInconsistencies, lastSearchTimestamp: inconsistencyTimestamp } = useInconsistencyContext();

    const [messageVisible, setMessageVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const traceCount = highlightedTraceLinks.length;
        const inconsistencyCount = highlightedInconsistencies.length;

        let newMessage: string;

        if (inconsistencies) {
            const traceText = traceCount === 0 ? 'No traceLinks' :
                traceCount === 1 ? '1 traceLink' :
                    `${traceCount} traceLinks`;

            const inconsistencyText = inconsistencyCount === 0 ? 'no inconsistencies' :
                inconsistencyCount === 1 ? '1 inconsistency' :
                    `${inconsistencyCount} inconsistencies`;

            newMessage = `${traceText} and ${inconsistencyText} found.`;

        } else {
            newMessage = traceCount === 0 ? 'No traceLinks found' :
                traceCount === 1 ? '1 traceLink found' :
                    `${traceCount} traceLinks found`;
        }

        if (newMessage && (traceLinkTimestamp !== 0  || inconsistencyTimestamp !== 0)) {
            if (hideTimeout) clearTimeout(hideTimeout);

            setCurrentMessage(newMessage);
            setMessageVisible(true);

            const timeout = setTimeout(() => {
                setMessageVisible(false);
                setCurrentMessage(null);
            }, 2000);
            setHideTimeout(timeout);
        }

        return () => {
            if (hideTimeout) clearTimeout(hideTimeout);
        };
    }, [highlightedTraceLinks, highlightedInconsistencies, inconsistencies]);

    return (
        <div className="bg-white z-1 relative h-full">

            {/* Main panel layout for displaying results */}
            <ResultPanelsLayout
                id={id}
                displayOptions={displayOptions}
                traceLinkType={traceLinkType}
                setSelectedDialogView={setSelectedDialogView}
                showThreePanels={true} // Control how many panels are rendered in the main layout
            />

            {/* Full-screen dialog for detailed view */}
            <FullScreenResultDialog
                selectedView={selectedDialogView}
                onClose={() => setSelectedDialogView(null)}
                onSelectView={setSelectedDialogView}
                displayOptions={displayOptions}
                id={id}
                traceLinkType={traceLinkType}
            />

            {messageVisible && currentMessage && (
                <div
                    key={currentMessage + traceLinkTimestamp + inconsistencyTimestamp}
                    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blau text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn"
                >
                    {currentMessage}
                </div>
            )}
        </div>
    );
}