'use client';

import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/Documentation";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModel";
import {Button, Dialog, Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModel";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkDisplay";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {Suspense, useMemo} from "react";
import InconsistencyViewer from "@/components/traceLinksResultViewer/views/inconsistencies/InconsistencyViewer";


interface FullScreenResultDialogProps {
    /** The currently selected view type for the dialog, or null if closed. */
    selectedView: ResultPanelType | null;
    /** Callback function to close the dialog or change the selected view. */
    onClose: () => void;
    /** Callback function to update the selected view within the dialog. */
    onSelectView: (view: ResultPanelType) => void;
    /** The list of all available result panel types. */
    displayOptions: ResultPanelType[];
    /** The unique ID associated with the result. */
    id: string;
    /** The type of trace link, passed to relevant views (e.g., TraceLinkView). */
    traceLinkType: TraceLinkType;
}

/**
 * A full-screen dialog component for displaying detailed views of different result panels.
 * It uses a tabbed interface for navigation between various result representations.
 *
 * @param {FullScreenResultDialogProps} props - The props for the component.
 * @returns {JSX.Element} The rendered full-screen dialog.
 */
export default function FullScreenResultDialog({selectedView,
                                               onClose,
                                               onSelectView,
                                               displayOptions,
                                               id,
                                               traceLinkType,
                                           } : FullScreenResultDialogProps){
    // Memoize the content mapping for performance
    const tabContent = useMemo(() => ({
        [ResultPanelType.Documentation]: <DisplayDocumentation id={id} />,
        [ResultPanelType.Code_Model]: <DisplayCodeModel id={id} />,
        [ResultPanelType.Architecture_Model]: <DisplayArchitectureModel id={id} />,
        [ResultPanelType.TraceLinks]: <TraceLinkView traceLinkType={traceLinkType} />,
        [ResultPanelType.Inconsistencies]: <Suspense fallback={<h1>Loading. This might take a while.</h1>}><InconsistencyViewer/></Suspense>,
    }), [id, traceLinkType]);

    const selectedIndex = selectedView ? displayOptions.indexOf(selectedView) : 0;

    return (
        <Dialog onClose={onClose} open={selectedView !== null} className="bg-white fixed inset-0 overflow-y-auto z-[1000]"> {/* Use inset-0 for full screen, z-index for high layering */}
            <TabGroup selectedIndex={selectedIndex} onChange={(index) => onSelectView(displayOptions[index])} manual>
                <TabList className="sticky top-0 left-0 flex bg-gradient-to-b from-gruen-400 to-gruen-500 px-2 z-[1001] ">
                    {displayOptions.map((option) => (
                        <Tab key={option} className="rounded-t data-[selected]:bg-white bg-blau-900 mr-2 mt-2 px-4 text-black ui-selected:text-gruen ui-not-selected:text-white focus:outline-none hover:bg-blau-800">
                            {option}
                        </Tab>
                    ))}
                    <div className="flex-grow" />
                    <Button onClick={onClose} className="p-3 text-white hover:text-gray-200">
                        <XMarkIcon className="w-5 h-5" />
                    </Button>
                </TabList>

                <TabPanels className="p-4"> {/* Add padding to tab panels */}
                    {displayOptions.map((option) => (
                        <TabPanel key={option}>
                            {tabContent[option]}
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </Dialog>
    );
};
