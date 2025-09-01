'use client'

import {ResultType} from "@/components/dataTypes/ResultType";
import React, {useState} from "react";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import FullScreenResultDialog from "@/components/traceLinksResultViewer/FullScreenResult";
import ResultPanelsLayout from "@/components/traceLinksResultViewer/ResultPanelLayout";
import {SearchResultMessage} from "@/components/traceLinksResultViewer/SearchResultMessage";

interface ResultDisplayProps {
    id: string;
    traceLinkType: TraceLinkType;
    displayOptions: ResultType[];
}

export function ResultDisplay({id, traceLinkType, displayOptions}: ResultDisplayProps) {
    const [selectedDialogView, setSelectedDialogView] = useState<ResultType | null>(null);

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