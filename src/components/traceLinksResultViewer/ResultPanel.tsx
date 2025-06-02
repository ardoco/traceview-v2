'use client'

import {Panel} from "react-resizable-panels";
import React, {Suspense, useState} from "react";
import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/Documentation";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModel";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModel";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkDisplay";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import {Dialog, Select, Button} from "@headlessui/react";
import {ArrowsPointingOutIcon} from "@heroicons/react/24/solid";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

interface ResultPanelProps {
    id: string;
    collapsible: boolean;
    JSONResult: any;
    displayOptions: ResultPanelType[];
    defaultView: ResultPanelType;
    setSelectedDialogView: (value: ResultPanelType | null) => void;
    traceLinkType:TraceLinkType;
}

export default function ResultPanel({ id, collapsible, JSONResult, displayOptions, defaultView, setSelectedDialogView, traceLinkType }: ResultPanelProps) {
    const [selectedPanel, setSelectedPanel] = useState(defaultView);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOptionChange = (value: ResultPanelType) => {
        setSelectedPanel(value);
    };

    return (
        <Panel
            minSize={10}
            className="h-full overflow-y-auto"
            style={{ overflowY: "auto", overflowX: "auto" }}
            collapsible={collapsible} // Use the input prop here
            collapsedSize={0}
        >
            {/*drop down*/}
            <div className="sticky top-0 flex bg-white">
                <Select value={selectedPanel} onChange={(e) => handleOptionChange(e.target.value as ResultPanelType)}
                        className="border-none flex-grow focus:ring-2 focus:ring-gruen focus:border-gruen ">
                    {displayOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
                <Button onClick={() => setSelectedDialogView(selectedPanel)} className="p-3">
                    <ArrowsPointingOutIcon className="w-4 h-4"/>
                </Button>
            </div>

            {selectedPanel === ResultPanelType.Documentation &&
                <Suspense fallback={<h1>Loading</h1>}><DisplayDocumentation JSONResult={JSONResult} id={id}/></Suspense>}
            {selectedPanel === ResultPanelType.Code_Model && <DisplayCodeModel JSONResult={JSONResult} id={id}/>}
            {selectedPanel === ResultPanelType.Architecture_Model && <DisplayArchitectureModel JSONResult={JSONResult} id={id}/>}
        {selectedPanel === ResultPanelType.Raw_JSON && <TraceLinkView JSONResult={JSONResult} traceLinkType={traceLinkType}/>}

            <Dialog onClose={() => setIsOpen(false)} open={isOpen} className="bg-white fixed top-0 left-0 w-full h-full overflow-y-auto z-1000">
                {selectedPanel === ResultPanelType.Documentation && <Suspense fallback={<h1>Loading</h1>}><DisplayDocumentation JSONResult={JSONResult} id={id}/></Suspense>}
                {selectedPanel === ResultPanelType.Code_Model && <DisplayCodeModel JSONResult={JSONResult} id={id}/>}
                {selectedPanel === ResultPanelType.Architecture_Model && <DisplayArchitectureModel JSONResult={JSONResult} id={id}/>}
                {selectedPanel === ResultPanelType.Raw_JSON && <TraceLinkView JSONResult={JSONResult} traceLinkType={traceLinkType}/>}
            </Dialog>
        </Panel>
    );
}
