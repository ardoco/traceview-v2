'use client'

import {Panel} from "react-resizable-panels";
import React, {useState} from "react";
import {displayOptionName, ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import {Button, Select} from "@headlessui/react";
import {ArrowsPointingOutIcon} from "@heroicons/react/24/solid";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {getResultPanel} from "@/components/traceLinksResultViewer/TabContent";

interface ResultPanelProps {
    id: string;
    collapsible: boolean;
    displayOptions: ResultPanelType[];
    defaultView: ResultPanelType;
    setSelectedDialogView: (value: ResultPanelType | null) => void;
    traceLinkType: TraceLinkType;
}

export default function ResultPanel({
                                        id,
                                        collapsible,
                                        displayOptions,
                                        defaultView,
                                        setSelectedDialogView,
                                        traceLinkType
                                    }: ResultPanelProps) {
    const [selectedPanel, setSelectedPanel] = useState(defaultView);

    const handleOptionChange = (value: ResultPanelType) => {
        setSelectedPanel(value);
    };

    return (
        <Panel
            minSize={10}
            className="h-full overflow-y-auto"
            style={{overflowY: "auto", overflowX: "auto"}}
            collapsible={collapsible}
            collapsedSize={0}
        >
            {/*drop down*/}
            <div className="sticky top-0 flex bg-white">
                <Select value={selectedPanel} onChange={(e) => handleOptionChange(e.target.value as ResultPanelType)}
                        className="border-none flex-grow focus:ring-2 focus:ring-gruen focus:outline-none">
                    {displayOptions
                        .map((option) => (
                            <option key={option} value={option}>
                                {displayOptionName(option, traceLinkType)}
                            </option>
                        ))}
                </Select>
                <Button onClick={() => setSelectedDialogView(selectedPanel)} className="p-3">
                    <ArrowsPointingOutIcon className="w-4 h-4"/>
                </Button>
            </div>

            {getResultPanel(selectedPanel, id, 10)}

        </Panel>
    );
}
