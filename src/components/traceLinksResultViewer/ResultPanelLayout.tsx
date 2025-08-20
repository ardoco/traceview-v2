import React from "react";
import {PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResultPanel from "@/components/traceLinksResultViewer/ResultPanel";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

/**
 * Props for the ResultPanelsLayout component.
 */
interface ResultPanelsLayoutProps {
    /** The unique ID associated with the result. */
    id: string;
    /** The list of available result panel types to display. */
    displayOptions: ResultPanelType[];
    /** The type of trace link, used for specific panel behaviors. */
    traceLinkType: TraceLinkType;
    /** Callback function to set the currently selected view for the full-screen dialog. */
    setSelectedDialogView: (view: ResultPanelType | null) => void;
    /** A boolean indicating whether to show three panels or limit to two. */
    showThreePanels: boolean; // Keeping this prop as per your original logic
}

/**
 * Renders the layout of result panels using `react-resizable-panels`.
 * It dynamically creates `ResultPanel` components based on `displayOptions`.
 *
 * @param {ResultPanelsLayoutProps} props - The props for the component.
 * @returns {JSX.Element} The rendered panel group with result panels.
 */
export default function ResultPanelsLayout({
                                               id,
                                               displayOptions,
                                               traceLinkType,
                                               setSelectedDialogView,
                                               showThreePanels,
                                           }: ResultPanelsLayoutProps) {
    // Limit the panels to 3 or 2 based on the `showThreePanels` state
    const panelsToRender = showThreePanels ? displayOptions.slice(0, 3) : displayOptions.slice(0, 2);

    return (
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
                    {/* Render a PanelResizeHandle between panels, if necessary */}
                    {index !== panelsToRender.length - 1 && <PanelResizeHandle className="w-0.5 bg-gruen"/>}
                </React.Fragment>
            ))}
        </PanelGroup>
    );
}

