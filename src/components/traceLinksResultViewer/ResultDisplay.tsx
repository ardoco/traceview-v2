// Result Display Component
import {PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResultView from "@/components/traceLinksResultViewer/ResultViewer";
import {ResultViewOptions} from "@/components/dataTypes/ResultViewOptions";
import React, {Suspense, useState} from "react";
import DisplayDocumentation from "@/components/traceLinksResultViewer/views/Documentation";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/CodeModel";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/ArchitectureModel";
import DisplayRawJsonTracelinks from "@/components/traceLinksResultViewer/views/RawJsonTracelinks";
import {Button, Dialog, Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";

interface ResultDisplayProps {
    result: any;
    id: string;
    traceLinkType: TraceLinkType;
}

export function ResultDisplay({result, id, traceLinkType}:ResultDisplayProps) {

    const [selectedDialogView, setSelectedDialogView] = useState<ResultViewOptions | null>(null);
    const [showThreePanels, setShowThreePanels] = useState(true); // State to toggle between 2 or 3 panels
    const displayOptions:ResultViewOptions[] = traceLinkType.resultViewOptions;

    const tabContent = {
        [ResultViewOptions.Documentation]: <DisplayDocumentation JSONResult={result} id={id} />,
        [ResultViewOptions.Code_Model]: <DisplayCodeModel JSONResult={result} id={id} />,
        [ResultViewOptions.Architecture_Model]: <DisplayArchitectureModel JSONResult={result} id={id} />,
        [ResultViewOptions.Raw_JSON]: <DisplayRawJsonTracelinks JSONResult={result} />,
    };

    // Limit the panels to 3 or 2 based on the `showThreePanels` state
    const optionsToDisplay:ResultViewOptions[] = showThreePanels ? displayOptions.slice(0, 3) : displayOptions.slice(0, 2);


    return (
        <div className="bg-white z-1 relative h-full">
            {/*{result === null && <div className="text-center">"Result is loading"</div>}*/}

            {/*/!* Toggle button to switch between 2 or 3 panels *!/*/}
            {/*<div className="text-center mt-2">*/}
            {/*    <Button*/}
            {/*        onClick={() => setShowThreePanels(prev => !prev)}*/}
            {/*        className="bg-gruen-500 text-white p-2 rounded"*/}
            {/*    >*/}
            {/*        {showThreePanels ? "Show 2 Panels" : "Show 3 Panels"}*/}
            {/*    </Button>*/}
            {/*</div>*/}

            <PanelGroup direction="horizontal" className="h-full">
                {optionsToDisplay.map((resultViewOption, index) => (
                    <React.Fragment key={index}>
                        {/* Dynamically generate ResultView for each display option */}
                        <ResultView
                            collapsible={index === 0 || index === optionsToDisplay.length - 1}  // Only first and last panels are collapsible
                            JSONResult={result}
                            displayOptions={displayOptions}
                            defaultView={resultViewOption}
                            setSelectedDialogView={setSelectedDialogView}
                            id={id}
                        />
                        {/* Render a PanelResizeHandle between panels, if necessary */}
                        {index !== optionsToDisplay.length - 1 && <PanelResizeHandle className="w-0.5 bg-gruen" />}
                    </React.Fragment>
                ))}
            </PanelGroup>


            <Dialog onClose={() => setSelectedDialogView(null)} open={selectedDialogView != null} className="bg-white fixed top-0 left-0 w-full h-full overflow-y-auto z-1000">
                <TabGroup selectedIndex={displayOptions.indexOf(selectedDialogView!)} onChange={(index) => setSelectedDialogView(displayOptions[index])} manual>
                    <TabList className="sticky top-0 left-0 flex bg-linear-to-b from-gruen-400 to-gruen-500 px-2">
                        {displayOptions.map((option) => (
                            <Tab key={option} className=" rounded-t data-[selected]:bg-white bg-black-900 mr-2 mt-2 px-4 text-black">
                                {option}
                            </Tab>
                        ))}
                        <div className="flex-grow" />
                        <Button onClick={() => setSelectedDialogView(null)} className="p-3">
                            <XMarkIcon className="w-5 h-5" />
                        </Button>
                    </TabList>

                    <TabPanels>
                        {displayOptions.map((option) => (
                            <TabPanel key={option}>
                                {tabContent[option]}
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </Dialog>
        </div>
    );
}