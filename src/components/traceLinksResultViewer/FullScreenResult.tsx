'use client';

import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/DocumentationViewer";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModelViewer";
import {Button, Dialog, Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModel";
import {displayOptionName, ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer";
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
        [ResultPanelType.TraceLinks]: <TraceLinkView traceLinkType={traceLinkType} headerOffset={0} />,
        [ResultPanelType.Inconsistencies]: <Suspense fallback={<h1>Loading. This might take a while.</h1>}><InconsistencyViewer headerOffset={0}/></Suspense>,
    }), [id, traceLinkType]);

    const selectedIndex = selectedView ? displayOptions.indexOf(selectedView) : 0;

    return (
        <Dialog onClose={onClose} open={selectedView !== null} className="bg-white fixed inset-0 z-[1000] flex flex-col">
            <TabGroup selectedIndex={selectedIndex} onChange={(index) => onSelectView(displayOptions[index])} manual className="flex flex-col h-full">
                {/* Header: Stays at the top and does not shrink */}
                <TabList className="flex-shrink-0 flex items-center bg-gray-100 border-b border-gray-300 px-4 z-[1001]">
                    {displayOptions.map((option) => (
                        <Tab
                            key={option}
                            className="
                                px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ease-in-out
                                focus:outline-none rounded-t-md
                                data-[selected]:text-blau-600 data-[selected]:border-blau-500
                                data-[not-selected]:text-gray-600 data-[not-selected]:border-transparent
                                data-[not-selected]:hover:bg-gray-200 data-[not-selected]:hover:text-gray-800
                            "
                        >
                            {displayOptionName(option, traceLinkType)}
                        </Tab>
                    ))}
                    <div className="flex-grow" /> {/* Pushes the close button to the right */}
                    <Button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full focus:outline-none">
                        <XMarkIcon className="w-6 h-6" />
                    </Button>
                </TabList>

                {/* Content Panels: Grow to fill available space and handle their own scrolling */}
                <TabPanels className="flex-grow overflow-y-auto">
                    {displayOptions.map((option) => (
                        <TabPanel key={option} className="h-full">
                            {tabContent[option]}
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </Dialog>
    );
};
