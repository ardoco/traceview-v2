'use client'

import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import React, {useState} from "react";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import FullScreenResultDialog from "@/components/traceLinksResultViewer/FullScreenResult";
import ResultPanelsLayout from "@/components/traceLinksResultViewer/ResultPanelLayout";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";
import NoTraceLinksMessage from "@/components/traceLinksResultViewer/NoTraceLinksMessage";

interface ResultDisplayProps {
    result: any;
    id: string;
    traceLinkType: TraceLinkType;
}

export function ResultDisplay({result, id, traceLinkType}:ResultDisplayProps) {

    const [selectedDialogView, setSelectedDialogView] = useState<ResultPanelType | null>(null);
    const [showThreePanels, setShowThreePanels] = useState(true); // State to toggle between 2 or 3 panels
    const displayOptions:ResultPanelType[] = traceLinkType.resultViewOptions;
    const { showNoTraceLinksMessage } = useHighlightContext();

    return (
        <div className="bg-white z-1 relative h-full">

            {/* Main panel layout for displaying results */}
            <ResultPanelsLayout
                JSONResult={result}
                id={id}
                displayOptions={displayOptions} // Pass all options, layout component will slice
                traceLinkType={traceLinkType}
                setSelectedDialogView={setSelectedDialogView}
                showThreePanels={showThreePanels} // Control how many panels are rendered in the main layout
            />

            {/* Full-screen dialog for detailed view */}
            <FullScreenResultDialog
                selectedView={selectedDialogView}
                onClose={() => setSelectedDialogView(null)}
                onSelectView={setSelectedDialogView}
                displayOptions={displayOptions}
                JSONResult={result}
                id={id}
                traceLinkType={traceLinkType}
            />

            {showNoTraceLinksMessage && (
                <NoTraceLinksMessage/>
            )}

            {/* Optional: A button to toggle between 2 and 3 panels for the main layout */}
            {/* <div className="absolute bottom-4 right-10 -translate-x-1/2 z-20">*/}
            {/*    <button*/}
            {/*        onClick={() => setShowThreePanels(prev => !prev)}*/}
            {/*        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"*/}
            {/*    >*/}
            {/*        Toggle {showThreePanels ? '2' : '3'} Panels*/}
            {/*    </button>*/}
            {/*</div>*/}


        </div>
    );
}