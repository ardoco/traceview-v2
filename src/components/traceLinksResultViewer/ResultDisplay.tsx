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
            <ResultPanelsLayout
                id={id}
                displayOptions={displayOptions}
                traceLinkType={traceLinkType}
                setSelectedDialogView={setSelectedDialogView}
            />

            <FullScreenResultDialog
                selectedView={selectedDialogView}
                onClose={() => setSelectedDialogView(null)}
                onSelectView={setSelectedDialogView}
                displayOptions={displayOptions}
                id={id}
                traceLinkType={traceLinkType}
            />

            <SearchResultMessage
                displayOptions={displayOptions}
            />
        </div>
    );
}