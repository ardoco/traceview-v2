'use client'

import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import React, {useState} from "react";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import FullScreenResultDialog from "@/components/traceLinksResultViewer/FullScreenResult";
import ResultPanelsLayout from "@/components/traceLinksResultViewer/ResultPanelLayout";
import {SearchResultMessage} from "@/components/traceLinksResultViewer/SearchResultMessage";

interface ResultDisplayProps {
    id: string;
    traceLinkType: TraceLinkType;
    displayOptions: ResultPanelType[];
}

export function ResultDisplay({id, traceLinkType, displayOptions}: ResultDisplayProps) {
    const [selectedDialogView, setSelectedDialogView] = useState<ResultPanelType | null>(null);

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

            {/* Search result message */}
            <SearchResultMessage
                displayOptions={displayOptions}
            />
        </div>
    );
}