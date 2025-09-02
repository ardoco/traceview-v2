'use client'

import {DisplayOption} from "@/components/dataTypes/DisplayOption";
import React, {useState} from "react";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import FullScreenResultDialog from "@/components/traceLinksResultViewer/FullScreenResult";
import {SearchResultMessage} from "@/components/traceLinksResultViewer/SearchResultMessage";
import ResultPanel from "@/components/traceLinksResultViewer/ResultPanel";
import {PanelGroup, PanelResizeHandle} from "react-resizable-panels";

interface ResultDisplayProps {
    id: string;
    traceLinkType: TraceLinkType;
    displayOptions: DisplayOption[];
}

export function ResultDisplay({id, traceLinkType, displayOptions}: ResultDisplayProps) {
    const [selectedDialogView, setSelectedDialogView] = useState<DisplayOption | null>(null);
    const panelsToRender = displayOptions.slice(0, 3);

    return (
        <div className="bg-white z-1 relative h-full">

            {/*panel*/}
            <PanelGroup direction="horizontal" className="h-full">
                {panelsToRender.map((resultViewOption, index) => (
                    <React.Fragment key={index}>
                        <ResultPanel
                            collapsible={index === 0 || index === panelsToRender.length - 1} // Only first and last panels are collapsible
                            displayOptions={displayOptions}
                            defaultView={resultViewOption}
                            setSelectedDialogView={setSelectedDialogView}
                            id={id}
                            traceLinkType={traceLinkType}
                        />
                        {index !== panelsToRender.length - 1 && <PanelResizeHandle className="w-0.5 bg-gruen"/>}
                    </React.Fragment>
                ))}
            </PanelGroup>

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